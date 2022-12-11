from fastapi import APIRouter, Depends

from ladderz.database import database
from ladderz.models.db.player import Player
from ladderz.models.db.round import Round
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import PlayersResponse, RoundsResponse, TournamentsResponse
from ladderz.schema import players, rounds, tournaments
from ladderz.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/tournaments/{tournament_id}/rounds", response_model=RoundsResponse)
async def get_rounds(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> RoundsResponse:
    return RoundsResponse(data=await fetch_all_parsed(database, Round, rounds.select()))
