from bracket.database import database
from bracket.models.db.round import Round
from bracket.schema import rounds
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_ROUND1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear, inserted_round, inserted_team


async def test_rounds_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_round(DUMMY_ROUND1) as round_inserted:
            assert await send_tournament_request(HTTPMethod.GET, 'rounds', auth_context, {}) == {
                'data': [
                    {
                        'created': DUMMY_MOCK_TIME.isoformat(),
                        'id': round_inserted.id,
                        'is_active': False,
                        'is_draft': False,
                        'matches': [],
                        'name': 'Round 1',
                        'tournament_id': 1,
                    }
                ],
            }


async def test_create_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        assert (
            await send_tournament_request(HTTPMethod.POST, 'rounds', auth_context, {})
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(rounds, 1)


async def test_delete_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_round(DUMMY_ROUND1) as round_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.DELETE, f'rounds/{round_inserted.id}', auth_context, {}
                )
                == SUCCESS_RESPONSE
            )
            await assert_row_count_and_clear(rounds, 0)


async def test_update_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name', 'is_draft': True, 'is_active': False}
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_round(DUMMY_ROUND1) as round_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.PATCH, f'rounds/{round_inserted.id}', auth_context, None, body
                )
                == SUCCESS_RESPONSE
            )
            patched_round = await fetch_one_parsed_certain(
                database, Round, query=rounds.select().where(rounds.c.id == round_inserted.id)
            )
            assert patched_round.name == body['name']
            assert patched_round.is_draft == body['is_draft']
            assert patched_round.is_active == body['is_active']

            await assert_row_count_and_clear(rounds, 1)
