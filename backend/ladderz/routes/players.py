from fastapi import APIRouter, Depends, Query
from heliclockter import datetime_utc

from ladderz.database import database
from ladderz.models.db.player import Player, PlayerBody, PlayerToInsert
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import PlayersResponse, SinglePlayerResponse, SuccessResponse
from ladderz.schema import players
from ladderz.utils.db import fetch_all_parsed, fetch_one_parsed

router = APIRouter()


@router.get("/tournaments/{tournament_id}/players", response_model=PlayersResponse)
async def get_players(
    tournament_id: int,
    not_in_team: bool = False,
    _: UserPublic = Depends(get_current_user),
) -> PlayersResponse:
    query = players.select().where(players.c.tournament_id == tournament_id)
    if not_in_team:
        query = query.where(players.c.team_id == None)

    return PlayersResponse(data=await fetch_all_parsed(database, Player, query))


@router.patch(
    "/tournaments/{tournament_id}/players/{player_id}", response_model=SinglePlayerResponse
)
async def update_player_by_id(
    tournament_id: int,
    player_id: int,
    player_body: PlayerBody,
    _: UserPublic = Depends(get_current_user),
) -> SinglePlayerResponse:
    await database.execute(
        query=players.update().where(
            (players.c.id == player_id) & (players.c.tournament_id == tournament_id)
        ),
        values=player_body.dict(),
    )
    return SinglePlayerResponse(
        data=await fetch_one_parsed(
            database,
            Player,
            players.select().where(
                (players.c.id == player_id) & (players.c.tournament_id == tournament_id)
            ),
        )
    )


@router.delete("/tournaments/{tournament_id}/players/{player_id}", response_model=SuccessResponse)
async def delete_player(
    tournament_id: int, player_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=players.delete().where(
            players.c.id == player_id and players.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/players", response_model=SinglePlayerResponse)
async def create_player(
    player_body: PlayerBody, tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> SinglePlayerResponse:
    last_record_id = await database.execute(
        query=players.insert(),
        values=PlayerToInsert(
            **player_body.dict(), created=datetime_utc.now(), tournament_id=tournament_id
        ).dict(),
    )
    return SinglePlayerResponse(
        data=await fetch_one_parsed(
            database,
            Player,
            players.select().where(
                players.c.id == last_record_id and players.c.tournament_id == tournament_id
            ),
        )
    )
