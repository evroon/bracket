from fastapi import APIRouter, Depends, HTTPException
from heliclockter import datetime_utc
from starlette import status

from bracket.database import database
from bracket.models.db.tournament import (
    Tournament,
    TournamentBody,
    TournamentToInsert,
    TournamentUpdateBody,
)
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated, user_authenticated_for_tournament
from bracket.routes.models import SuccessResponse, TournamentsResponse
from bracket.schema import tournaments
from bracket.utils.db import fetch_all_parsed
from bracket.utils.sql import get_user_access_to_club
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/tournaments", response_model=TournamentsResponse)
async def get_tournaments(_: UserPublic = Depends(user_authenticated)) -> TournamentsResponse:
    return TournamentsResponse(
        data=await fetch_all_parsed(database, Tournament, tournaments.select())
    )


@router.patch("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def update_tournament_by_id(
    tournament_id: int,
    tournament_body: TournamentUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await database.execute(
        query=tournaments.update().where(tournaments.c.id == tournament_id),
        values=tournament_body.dict(),
    )
    return SuccessResponse()


@router.delete("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def delete_tournament(
    tournament_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    await database.execute(
        query=tournaments.delete().where(
            tournaments.c.id == tournament_id and tournaments.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments", response_model=SuccessResponse)
async def create_tournament(
    tournament_to_insert: TournamentBody, user: UserPublic = Depends(user_authenticated)
) -> SuccessResponse:
    has_access_to_club = await get_user_access_to_club(
        tournament_to_insert.club_id, assert_some(user.id)
    )
    if not has_access_to_club:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Club ID is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await database.execute(
        query=tournaments.insert(),
        values=TournamentToInsert(
            **tournament_to_insert.dict(),
            created=datetime_utc.now(),
        ).dict(),
    )
    return SuccessResponse()
