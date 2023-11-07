from bracket.database import database
from bracket.models.db.tournament import Tournament
from bracket.schema import tournaments
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TOURNAMENT
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import (
    SUCCESS_RESPONSE,
    send_auth_request,
    send_tournament_request,
)
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear, inserted_tournament


async def test_tournaments_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(HTTPMethod.GET, 'tournaments', auth_context, {}) == {
        'data': [
            {
                'id': auth_context.tournament.id,
                'club_id': auth_context.club.id,
                'created': DUMMY_MOCK_TIME.isoformat(),
                'start_time': DUMMY_MOCK_TIME.isoformat(),
                'name': 'Some Cool Tournament',
                'dashboard_public': True,
                'dashboard_endpoint': 'cool-tournament',
                'players_can_be_in_multiple_teams': True,
                'auto_assign_courts': True,
            }
        ],
    }


async def test_tournament_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(
        HTTPMethod.GET, f'tournaments/{auth_context.tournament.id}', auth_context, {}
    ) == {
        'data': {
            'id': auth_context.tournament.id,
            'club_id': auth_context.club.id,
            'created': DUMMY_MOCK_TIME.isoformat(),
            'start_time': DUMMY_MOCK_TIME.isoformat(),
            'name': 'Some Cool Tournament',
            'dashboard_public': True,
            'dashboard_endpoint': 'cool-tournament',
            'players_can_be_in_multiple_teams': True,
            'auto_assign_courts': True,
        },
    }


async def test_create_tournament(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {
        'name': 'Some new name',
        'start_time': DUMMY_MOCK_TIME.isoformat(),
        'club_id': auth_context.club.id,
        'dashboard_public': False,
        'players_can_be_in_multiple_teams': True,
        'auto_assign_courts': True,
    }
    assert (
        await send_auth_request(HTTPMethod.POST, 'tournaments', auth_context, json=body)
        == SUCCESS_RESPONSE
    )
    await database.execute(tournaments.delete().where(tournaments.c.name == body['name']))


async def test_update_tournament(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {
        'name': 'Some new name',
        'start_time': DUMMY_MOCK_TIME.isoformat(),
        'dashboard_public': False,
        'players_can_be_in_multiple_teams': True,
        'auto_assign_courts': True,
    }
    assert (
        await send_tournament_request(HTTPMethod.PUT, '', auth_context, json=body)
        == SUCCESS_RESPONSE
    )
    updated_tournament = await fetch_one_parsed_certain(
        database,
        Tournament,
        query=tournaments.select().where(tournaments.c.id == auth_context.tournament.id),
    )
    assert updated_tournament.name == body['name']
    assert updated_tournament.dashboard_public == body['dashboard_public']

    await assert_row_count_and_clear(tournaments, 1)


async def test_delete_tournament(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_tournament(
        DUMMY_TOURNAMENT.copy(update={'club_id': auth_context.club.id})
    ) as tournament_inserted:
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, '', auth_context.copy(update={'tournament': tournament_inserted})
            )
            == SUCCESS_RESPONSE
        )

    await assert_row_count_and_clear(tournaments, 0)
