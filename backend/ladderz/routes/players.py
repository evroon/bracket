from fastapi import APIRouter, Depends

from ladderz.database import database
from ladderz.models.db.player import Player
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import PlayersResponse, TournamentsResponse
from ladderz.schema import players, tournaments
from ladderz.utils.db import fetch_all_parsed

router = APIRouter()


@router.get("/tournaments/{tournament_id}/players", response_model=PlayersResponse)
async def get_players(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> PlayersResponse:
    return PlayersResponse(data=await fetch_all_parsed(database, Player, players.select()))
