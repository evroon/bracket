from bracket.database import database
from bracket.models.db.tournament import Tournament
from bracket.schema import tournaments
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_MOCK_TIME
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import (
    SUCCESS_RESPONSE,
    send_auth_request,
    send_tournament_request,
)
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear


async def test_tournaments_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(HTTPMethod.GET, 'tournaments', auth_context, {}) == {
        'data': [
            {
                'id': auth_context.tournament.id,
                'club_id': auth_context.club.id,
                'created': DUMMY_MOCK_TIME.isoformat(),
                'name': 'Some Cool Tournament',
                'dashboard_public': True,
            }
        ],
    }


async def test_update_tournament(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name', 'dashboard_public': False}
    assert (
        await send_tournament_request(HTTPMethod.PATCH, '', auth_context, None, body)
        == SUCCESS_RESPONSE
    )
    patched_tournament = await fetch_one_parsed_certain(
        database,
        Tournament,
        query=tournaments.select().where(tournaments.c.id == auth_context.tournament.id),
    )
    assert patched_tournament.name == body['name']
    assert patched_tournament.dashboard_public == body['dashboard_public']

    await assert_row_count_and_clear(tournaments, 1)
