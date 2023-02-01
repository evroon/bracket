from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.logic.scheduling.ladder_players_iter import get_possible_upcoming_matches_for_players

from bracket.models.db.match import Match, MatchBody, MatchCreateBody, MatchFilter, MatchToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import SuccessResponse, UpcomingMatchesResponse
from bracket.routes.util import match_dependency
from bracket.schema import matches

router = APIRouter()


@router.get("/tournaments/{tournament_id}/upcoming_matches", response_model=UpcomingMatchesResponse)
async def get_matches_to_schedule(
    tournament_id: int,
    elo_diff_threshold: int = 100,
    iterations: int = 200,
    only_behind_schedule: bool = False,
    limit: int = 50,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> UpcomingMatchesResponse:
    match_filter = MatchFilter(
        elo_diff_threshold=elo_diff_threshold,
        only_behind_schedule=only_behind_schedule,
        limit=limit,
        iterations=iterations,
    )
    return UpcomingMatchesResponse(
        data=await get_possible_upcoming_matches_for_players(tournament_id, match_filter)
    )
    # return UpcomingMatchesResponse(
    #     data=await get_possible_upcoming_matches_for_teams(tournament_id, MatchFilter())
    # )


@router.delete("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def delete_match(
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    match: Match = Depends(match_dependency),
) -> SuccessResponse:
    await database.execute(
        query=matches.delete().where(
            matches.c.id == match.id and matches.c.tournament_id == tournament_id
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/matches", response_model=SuccessResponse)
async def create_match(
    match_body: MatchCreateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await database.execute(
        query=matches.insert(),
        values=MatchToInsert(
            created=datetime_utc.now(),
            **match_body.dict(),
        ).dict(),
    )
    return SuccessResponse()


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
