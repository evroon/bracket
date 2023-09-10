from fastapi import APIRouter, Depends, HTTPException

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.logic.scheduling.ladder_players_iter import get_possible_upcoming_matches_for_players
from bracket.logic.scheduling.round_robin import get_possible_upcoming_matches_round_robin
from bracket.models.db.match import Match, MatchBody, MatchCreateBody, MatchFilter
from bracket.models.db.round import Round
from bracket.models.db.stage import StageType
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import SingleMatchResponse, SuccessResponse, UpcomingMatchesResponse
from bracket.routes.util import match_dependency, round_dependency
from bracket.schema import matches
from bracket.sql.matches import sql_create_match, sql_delete_match
from bracket.sql.stages import get_stages_with_rounds_and_matches
from bracket.utils.types import assert_some

router = APIRouter()


@router.get(
    "/tournaments/{tournament_id}/rounds/{round_id}/upcoming_matches",
    response_model=UpcomingMatchesResponse,
)
async def get_matches_to_schedule(
    tournament_id: int,
    elo_diff_threshold: int = 100,
    iterations: int = 200,
    only_behind_schedule: bool = False,
    limit: int = 50,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round_: Round = Depends(round_dependency),
) -> UpcomingMatchesResponse:
    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_behind_schedule=only_behind_schedule,
        limit=limit,
        iterations=iterations,
    )

    if not round_.is_draft:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    [stage] = await get_stages_with_rounds_and_matches(tournament_id, stage_id=round_.stage_id)
    match stage.type:
        case StageType.ROUND_ROBIN:
            upcoming_matches = await get_possible_upcoming_matches_round_robin(
                tournament_id, assert_some(stage.id), assert_some(round_.id)
            )

        case StageType.SWISS:
            upcoming_matches = await get_possible_upcoming_matches_for_players(
                tournament_id, match_filter, assert_some(stage.id), assert_some(round_.id)
            )

        case _:
            raise NotImplementedError(f'Cannot suggest matches for stage type {stage.type}')

    return UpcomingMatchesResponse(data=upcoming_matches)


@router.delete("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def delete_match(
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await sql_delete_match(assert_some(match.id))
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/matches", response_model=SingleMatchResponse)
async def create_match(
    tournament_id: int,
    match_body: MatchCreateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleMatchResponse:
    return SingleMatchResponse(data=await sql_create_match(match_body))


@router.patch("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def update_match_by_id(
    tournament_id: int,
    match_body: MatchBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await database.execute(
        query=matches.update().where(matches.c.id == match.id),
        values=match_body.dict(),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()
