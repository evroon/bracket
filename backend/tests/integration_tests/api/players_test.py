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
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_player(DUMMY_PLAYER1) as player_inserted:
            assert await send_tournament_request(HTTPMethod.GET, 'players', auth_context, {}) == {
                'data': [
                    {
                        'created': DUMMY_MOCK_TIME.isoformat(),
                        'id': player_inserted.id,
                        'elo_score': 0.0,
                        'wins': 0,
                        'draws': 0,
                        'losses': 0,
                        'name': 'Luke',
                        'team_id': 1,
                        'tournament_id': 1,
                    }
                ],
            }


async def test_create_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name'}
    response = await send_tournament_request(HTTPMethod.POST, 'players', auth_context, json=body)
    assert response['data']['name'] == body['name']  # type: ignore[call-overload]
    await assert_row_count_and_clear(players, 1)


async def test_delete_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1) as team_inserted:
        async with inserted_player(
            DUMMY_PLAYER1.copy(update={'team_id': team_inserted.id})
        ) as player_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.DELETE, f'players/{player_inserted.id}', auth_context
                )
                == SUCCESS_RESPONSE
            )
            await assert_row_count_and_clear(players, 0)


async def test_update_player(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name'}
    async with inserted_team(DUMMY_TEAM1) as team_inserted:
        async with inserted_player(
            DUMMY_PLAYER1.copy(update={'team_id': team_inserted.id})
        ) as player_inserted:
            response = await send_tournament_request(
                HTTPMethod.PATCH, f'players/{player_inserted.id}', auth_context, json=body
            )
            patched_player = await fetch_one_parsed_certain(
                database, Player, query=players.select().where(players.c.id == player_inserted.id)
            )
            assert patched_player.name == body['name']
            assert response['data']['name'] == body['name']  # type: ignore[call-overload]

            await assert_row_count_and_clear(players, 1)
