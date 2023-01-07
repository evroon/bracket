from fastapi import APIRouter, Depends

from bracket.database import database
from bracket.models.db.club import Club
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated
from bracket.routes.models import ClubsResponse
from bracket.schema import clubs
from bracket.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/clubs", response_model=ClubsResponse)
async def get_clubs(_: UserPublic = Depends(user_authenticated)) -> ClubsResponse:
    return ClubsResponse(data=await fetch_all_parsed(database, Club, clubs.select()))
