from bracket.database import database
from bracket.models.db.player import Player
from bracket.schema import players
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_PLAYER1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear, inserted_player, inserted_team


async def test_players_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_player(
            DUMMY_PLAYER1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as player_inserted:
            assert await send_tournament_request(HTTPMethod.GET, "players", auth_context, {}) == {
                "data": {
                    "players": [
                        {
                            "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                            "id": player_inserted.id,
                            "active": True,
                            "elo_score": "0.0",
                            "swiss_score": "0.0",
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "name": "Player 01",
                            "tournament_id": auth_context.tournament.id,
                        }
                    ],
                    "count": 1,
                },
            }


async def test_create_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Some new name", "active": True}
    response = await send_tournament_request(HTTPMethod.POST, "players", auth_context, json=body)
    assert response["success"] is True
    await assert_row_count_and_clear(players, 1)


async def test_create_players(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"names": "Player x\nPlayer y", "active": True}
    response = await send_tournament_request(
        HTTPMethod.POST, "players_multi", auth_context, json=body
    )
    assert response["success"] is True
    await assert_row_count_and_clear(players, 2)


async def test_delete_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_player(
            DUMMY_PLAYER1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as player_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.DELETE, f"players/{player_inserted.id}", auth_context
                )
                == SUCCESS_RESPONSE
            )
            await assert_row_count_and_clear(players, 0)


async def test_update_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Some new name", "active": True}
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_player(
            DUMMY_PLAYER1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as player_inserted:
            response = await send_tournament_request(
                HTTPMethod.PUT, f"players/{player_inserted.id}", auth_context, json=body
            )
            updated_player = await fetch_one_parsed_certain(
                database, Player, query=players.select().where(players.c.id == player_inserted.id)
            )
            assert updated_player.name == body["name"]
            assert response["data"]["name"] == body["name"]

            await assert_row_count_and_clear(players, 1)
