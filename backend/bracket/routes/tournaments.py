from fastapi import APIRouter, Depends

from bracket.database import database
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import TournamentsResponse
from bracket.schema import tournaments
from bracket.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/tournaments", response_model=TournamentsResponse)
async def get_tournaments(_: UserPublic = Depends(get_current_user)) -> TournamentsResponse:
    return TournamentsResponse(
        data=await fetch_all_parsed(database, Tournament, tournaments.select())
    )
