from fastapi import APIRouter, Depends

from ladderz.database import database
from ladderz.models.db.club import Club
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import ClubsResponse, TournamentsResponse
from ladderz.schema import clubs, tournaments
from ladderz.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/clubs", response_model=ClubsResponse)
async def get_clubs(_: UserPublic = Depends(get_current_user)) -> ClubsResponse:
    return ClubsResponse(data=await fetch_all_parsed(database, Club, clubs.select()))
