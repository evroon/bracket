from fastapi import APIRouter, Depends

from bracket.database import database
from bracket.logic.subscriptions import check_requirement
from bracket.models.db.player import Player, PlayerBody, PlayerMultiBody
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import PlayersResponse, SinglePlayerResponse, SuccessResponse
from bracket.schema import players
from bracket.sql.players import get_all_players_in_tournament, insert_player, sql_delete_player
from bracket.utils.db import fetch_one_parsed
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/tournaments/{tournament_id}/players", response_model=PlayersResponse)
async def get_players(
    tournament_id: int,
    not_in_team: bool = False,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> PlayersResponse:
    return PlayersResponse(
        data=await get_all_players_in_tournament(tournament_id, not_in_team=not_in_team)
    )


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
    await sql_delete_player(tournament_id, player_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/players", response_model=SuccessResponse)
async def create_single_player(
    player_body: PlayerBody,
    tournament_id: int,
    user: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    existing_players = await get_all_players_in_tournament(tournament_id)
    check_requirement(existing_players, user, "max_players")
    await insert_player(player_body, tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/players_multi", response_model=SuccessResponse)
async def create_multiple_players(
    player_body: PlayerMultiBody,
    tournament_id: int,
    user: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    player_names = [player.strip() for player in player_body.names.split("\n") if len(player) > 0]
    existing_players = await get_all_players_in_tournament(tournament_id)
    check_requirement(existing_players, user, "max_players", additions=len(player_names))

    for player_name in player_names:
        await insert_player(PlayerBody(name=player_name, active=player_body.active), tournament_id)

    return SuccessResponse()
