from fastapi import APIRouter, Depends

from bracket.database import database
from bracket.models.db.club import Club
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import ClubsResponse, TournamentsResponse
from bracket.schema import clubs, tournaments
from bracket.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/clubs", response_model=ClubsResponse)
async def get_clubs(_: UserPublic = Depends(get_current_user)) -> ClubsResponse:
    return ClubsResponse(data=await fetch_all_parsed(database, Club, clubs.select()))
