from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.logic.upcoming_matches import get_possible_upcoming_matches
from bracket.models.db.match import MatchBody, MatchCreateBody, MatchFilter, MatchToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import SuccessResponse, UpcomingMatchesResponse
from bracket.schema import matches

router = APIRouter()


@router.get("/tournaments/{tournament_id}/upcoming_matches", response_model=UpcomingMatchesResponse)
async def get_matches_to_schedule(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> UpcomingMatchesResponse:
    return UpcomingMatchesResponse(
        data=await get_possible_upcoming_matches(tournament_id, MatchFilter())
    )


@router.delete("/tournaments/{tournament_id}/matches/{match_id}", response_model=SuccessResponse)
async def delete_match(
    tournament_id: int, match_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=matches.delete().where(
            matches.c.id == match_id and matches.c.tournament_id == tournament_id
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/matches", response_model=SuccessResponse)
async def create_match(
    tournament_id: int, match_body: MatchCreateBody, _: UserPublic = Depends(get_current_user)
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
    match_id: int,
    match_body: MatchBody,
    _: UserPublic = Depends(get_current_user),
) -> SuccessResponse:
    await database.execute(
        query=matches.update().where(matches.c.id == match_id),
        values=match_body.dict(),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()
