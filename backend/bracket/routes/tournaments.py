from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.tournament import Tournament, TournamentBody, TournamentToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import SuccessResponse, TournamentsResponse
from bracket.schema import tournaments
from bracket.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/tournaments", response_model=TournamentsResponse)
async def get_tournaments(_: UserPublic = Depends(get_current_user)) -> TournamentsResponse:
    return TournamentsResponse(
        data=await fetch_all_parsed(database, Tournament, tournaments.select())
    )


@router.patch("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def update_tournament_by_id(
    tournament_id: int,
    tournament_body: TournamentBody,
    _: UserPublic = Depends(get_current_user),
) -> SuccessResponse:
    await database.execute(
        query=tournaments.update().where(tournaments.c.id == tournament_id),
        values=tournament_body.dict(),
    )
    return SuccessResponse()


@router.delete("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def delete_tournament(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=tournaments.delete().where(
            tournaments.c.id == tournament_id and tournaments.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments", response_model=SuccessResponse)
async def create_tournament(
    tournament_to_insert: TournamentBody, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=tournaments.insert(),
        values=TournamentToInsert(
            **tournament_to_insert.dict(),
            created=datetime_utc.now(),
        ).dict(),
    )
    return SuccessResponse()
