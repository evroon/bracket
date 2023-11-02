from decimal import Decimal

from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.player import Player, PlayerBody, PlayerToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import PlayersResponse, SinglePlayerResponse, SuccessResponse
from bracket.schema import players
from bracket.utils.db import fetch_all_parsed, fetch_one_parsed
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/tournaments/{tournament_id}/players", response_model=PlayersResponse)
async def get_players(
    tournament_id: int,
    not_in_team: bool = False,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> PlayersResponse:
    query = players.select().where(players.c.tournament_id == tournament_id)
    if not_in_team:
        query = query.where(players.c.team_id is None)

    return PlayersResponse(data=await fetch_all_parsed(database, Player, query))


@router.put("/tournaments/{tournament_id}/players/{player_id}", response_model=SinglePlayerResponse)
async def update_player_by_id(
    tournament_id: int,
    player_id: int,
    player_body: PlayerBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SinglePlayerResponse:
    await database.execute(
        query=players.update().where(
            (players.c.id == player_id) & (players.c.tournament_id == tournament_id)
        ),
        values=player_body.dict(),
    )
    return SinglePlayerResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Player,
                players.select().where(
                    (players.c.id == player_id) & (players.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.delete("/tournaments/{tournament_id}/players/{player_id}", response_model=SuccessResponse)
async def delete_player(
    tournament_id: int, player_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    await database.execute(
        query=players.delete().where(
            players.c.id == player_id and players.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/players", response_model=SinglePlayerResponse)
async def create_player(
    player_body: PlayerBody,
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SinglePlayerResponse:
    last_record_id = await database.execute(
        query=players.insert(),
        values=PlayerToInsert(
            **player_body.dict(),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
            elo_score=Decimal('0.0'),
            swiss_score=Decimal('0.0'),
        ).dict(),
    )
    return SinglePlayerResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Player,
                players.select().where(
                    players.c.id == last_record_id and players.c.tournament_id == tournament_id
                ),
            )
        )
    )
