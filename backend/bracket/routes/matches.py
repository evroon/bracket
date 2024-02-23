from fastapi import APIRouter, Depends, HTTPException

from bracket.logic.planning.matches import (
    handle_match_reschedule,
    schedule_all_unscheduled_matches,
)
from bracket.logic.ranking.elo import recalculate_ranking_for_tournament_id
from bracket.logic.scheduling.upcoming_matches import (
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
from bracket.models.db.round import Round
from bracket.models.db.user import UserPublic
from bracket.models.db.util import RoundWithMatches
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import SingleMatchResponse, SuccessResponse, UpcomingMatchesResponse
from bracket.routes.util import match_dependency, round_dependency, round_with_matches_dependency
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import sql_create_match, sql_delete_match, sql_update_match
from bracket.sql.tournaments import sql_get_tournament
from bracket.sql.validation import check_foreign_keys_belong_to_tournament
from bracket.utils.id_types import MatchId, TournamentId
from bracket.utils.types import assert_some

router = APIRouter()


@router.get(
    "/tournaments/{tournament_id}/rounds/{round_id}/upcoming_matches",
    response_model=UpcomingMatchesResponse,
)
async def get_matches_to_schedule(
    tournament_id: TournamentId,
    elo_diff_threshold: int = 200,
    iterations: int = 200,
    only_recommended: bool = False,
    limit: int = 50,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round_: Round = Depends(round_dependency),
) -> UpcomingMatchesResponse:
    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_recommended=only_recommended,
        limit=limit,
        iterations=iterations,
    )

    if not round_.is_draft:
        raise HTTPException(400, "There is no draft round, so no matches can be scheduled.")

    return UpcomingMatchesResponse(
        data=await get_upcoming_matches_for_swiss_round(match_filter, round_, tournament_id)
    )


@router.delete("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def delete_match(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await sql_delete_match(assert_some(match.id))
    await recalculate_ranking_for_tournament_id(tournament_id)
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
    "/tournaments/{tournament_id}/rounds/{round_id}/schedule_auto",
    response_model=SuccessResponse,
)
async def create_matches_automatically(
    tournament_id: TournamentId,
    elo_diff_threshold: int = 100,
    iterations: int = 200,
    only_recommended: bool = False,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round_: RoundWithMatches = Depends(round_with_matches_dependency),
) -> SuccessResponse:
    if not round_.is_draft:
        raise HTTPException(400, "There is no draft round, so no matches can be scheduled.")

    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_recommended=only_recommended,
        limit=1,
        iterations=iterations,
    )

    courts = await get_all_courts_in_tournament(tournament_id)
    tournament = await sql_get_tournament(tournament_id)

    limit = len(courts) - len(round_.matches)
    for __ in range(limit):
        all_matches_to_schedule = await get_upcoming_matches_for_swiss_round(
            match_filter, round_, tournament_id
        )
        if len(all_matches_to_schedule) < 1:
            break

        match = all_matches_to_schedule[0]
        assert isinstance(match, SuggestedMatch)

        assert round_.id and match.team1.id and match.team2.id
        await sql_create_match(
            MatchCreateBody(
                round_id=round_.id,
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
    match_body: MatchBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await check_foreign_keys_belong_to_tournament(match_body, tournament_id)
    tournament = await sql_get_tournament(tournament_id)

    await sql_update_match(assert_some(match.id), match_body, tournament)
    await recalculate_ranking_for_tournament_id(tournament_id)
    return SuccessResponse()
