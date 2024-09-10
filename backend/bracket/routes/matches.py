from fastapi import APIRouter, Depends

from bracket.logic.planning.matches import (
    get_scheduled_matches,
    handle_match_reschedule,
    reorder_matches_for_court,
    schedule_all_unscheduled_matches,
)
from bracket.logic.ranking.elo import (
    recalculate_ranking_for_stage_item_id,
)
from bracket.logic.scheduling.upcoming_matches import (
    get_draft_round_in_stage_item,
    get_upcoming_matches_for_swiss_round,
)
from bracket.models.db.match import (
    Match,
    MatchBody,
    MatchCreateBody,
    MatchCreateBodyFrontend,
    MatchFilter,
    MatchRescheduleBody,
    SuggestedMatch,
)
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import SingleMatchResponse, SuccessResponse, UpcomingMatchesResponse
from bracket.routes.util import match_dependency
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import sql_create_match, sql_delete_match, sql_update_match
from bracket.sql.rounds import get_round_by_id
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.sql.validation import check_foreign_keys_belong_to_tournament
from bracket.utils.id_types import MatchId, StageItemId, TournamentId
from bracket.utils.types import assert_some

router = APIRouter()


@router.get(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}/upcoming_matches",
    response_model=UpcomingMatchesResponse,
)
async def get_matches_to_schedule(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    elo_diff_threshold: int = 200,
    iterations: int = 200,
    only_recommended: bool = False,
    limit: int = 50,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> UpcomingMatchesResponse:
    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_recommended=only_recommended,
        limit=limit,
        iterations=iterations,
    )

    draft_round, stage_item = await get_draft_round_in_stage_item(tournament_id, stage_item_id)

    return UpcomingMatchesResponse(
        data=await get_upcoming_matches_for_swiss_round(
            match_filter, stage_item, draft_round, tournament_id
        )
    )


@router.delete("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def delete_match(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    round_ = await get_round_by_id(tournament_id, match.round_id)

    await sql_delete_match(match.id)

    await recalculate_ranking_for_stage_item_id(tournament_id, assert_some(round_).stage_item_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/matches", response_model=SingleMatchResponse)
async def create_match(
    tournament_id: TournamentId,
    match_body: MatchCreateBodyFrontend,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleMatchResponse:
    await check_foreign_keys_belong_to_tournament(match_body, tournament_id)

    tournament = await sql_get_tournament(tournament_id)
    body_with_durations = MatchCreateBody(
        **match_body.model_dump(),
        duration_minutes=tournament.duration_minutes,
        margin_minutes=tournament.margin_minutes,
    )

    return SingleMatchResponse(data=await sql_create_match(body_with_durations))


@router.post("/tournaments/{tournament_id}/schedule_matches", response_model=SuccessResponse)
async def schedule_matches(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await schedule_all_unscheduled_matches(tournament_id)
    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/matches/{match_id}/reschedule", response_model=SuccessResponse
)
async def reschedule_match(
    tournament_id: TournamentId,
    match_id: MatchId,
    body: MatchRescheduleBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await check_foreign_keys_belong_to_tournament(body, tournament_id)
    await handle_match_reschedule(tournament_id, body, match_id)
    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}/schedule_auto",
    response_model=SuccessResponse,
)
async def create_matches_automatically(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    elo_diff_threshold: int = 100,
    iterations: int = 200,
    only_recommended: bool = False,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_recommended=only_recommended,
        limit=1,
        iterations=iterations,
    )

    draft_round, stage_item = await get_draft_round_in_stage_item(tournament_id, stage_item_id)
    courts = await get_all_courts_in_tournament(tournament_id)
    tournament = await sql_get_tournament(tournament_id)

    limit = len(courts) - len(draft_round.matches)
    for __ in range(limit):
        all_matches_to_schedule = await get_upcoming_matches_for_swiss_round(
            match_filter, stage_item, draft_round, tournament_id
        )
        if len(all_matches_to_schedule) < 1:
            break

        match = all_matches_to_schedule[0]
        assert isinstance(match, SuggestedMatch)

        assert draft_round.id and match.team1.id and match.team2.id
        await sql_create_match(
            MatchCreateBody(
                round_id=draft_round.id,
                team1_id=match.team1.id,
                team2_id=match.team2.id,
                court_id=None,
                team1_winner_from_stage_item_id=None,
                team1_winner_position=None,
                team1_winner_from_match_id=None,
                team2_winner_from_stage_item_id=None,
                team2_winner_position=None,
                team2_winner_from_match_id=None,
                duration_minutes=tournament.duration_minutes,
                margin_minutes=tournament.margin_minutes,
                custom_duration_minutes=None,
                custom_margin_minutes=None,
            ),
        )

    return SuccessResponse()


@router.put("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def update_match_by_id(
    tournament_id: TournamentId,
    match_id: MatchId,
    match_body: MatchBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await check_foreign_keys_belong_to_tournament(match_body, tournament_id)
    tournament = await sql_get_tournament(tournament_id)

    await sql_update_match(match_id, match_body, tournament)

    round_ = await get_round_by_id(tournament_id, match.round_id)
    await recalculate_ranking_for_stage_item_id(tournament_id, assert_some(round_).stage_item_id)

    if (
        match_body.custom_duration_minutes != match.custom_duration_minutes
        or match_body.custom_margin_minutes != match.custom_margin_minutes
    ):
        tournament = await sql_get_tournament(tournament_id)
        scheduled_matches = get_scheduled_matches(await get_full_tournament_details(tournament_id))
        await reorder_matches_for_court(tournament, scheduled_matches, assert_some(match.court_id))

    return SuccessResponse()
