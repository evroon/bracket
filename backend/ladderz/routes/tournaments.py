from fastapi import APIRouter, Depends

from ladderz.database import database
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import TournamentsResponse
from ladderz.schema import tournaments
from ladderz.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/tournaments", response_model=TournamentsResponse)
async def get_tournaments(_: UserPublic = Depends(get_current_user)) -> TournamentsResponse:
    return TournamentsResponse(
        data=await fetch_all_parsed(database, Tournament, tournaments.select())
    )
