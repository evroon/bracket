import pytest

from bracket.models.db.stage import StageType
from bracket.schema import stages
from bracket.sql.stages import get_stages_with_rounds_and_matches
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_ROUND1, DUMMY_STAGE1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import (
    SUCCESS_RESPONSE,
    send_request,
    send_tournament_request,
)
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    assert_row_count_and_clear,
    inserted_round,
    inserted_stage,
    inserted_team,
)


@pytest.mark.parametrize(("with_auth",), [(True,), (False,)])
async def test_stages_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext, with_auth: bool
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1),
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
        inserted_round(DUMMY_ROUND1.copy(update={'stage_id': stage_inserted.id})) as round_inserted,
    ):
        if with_auth:
            response = await send_tournament_request(HTTPMethod.GET, 'stages', auth_context, {})
        else:
            response = await send_request(
                HTTPMethod.GET,
                f'tournaments/{auth_context.tournament.id}/stages?no_draft_rounds=true',
            )

        assert response == {
            'data': [
                {
                    'id': stage_inserted.id,
                    'tournament_id': 1,
                    'created': DUMMY_MOCK_TIME.isoformat(),
                    'type': 'ROUND_ROBIN',
                    'is_active': False,
                    'rounds': [
                        {
                            'id': round_inserted.id,
                            'stage_id': stage_inserted.id,
                            'created': '2022-01-11T04:32:11+00:00',
                            'is_draft': False,
                            'is_active': False,
                            'name': 'Round 1',
                            'matches': [],
                        }
                    ],
                }
            ]
        }


async def test_create_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        assert (
            await send_tournament_request(
                HTTPMethod.POST,
                'stages',
                auth_context,
                json={'type': StageType.SINGLE_ELIMINATION.value},
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(stages, 1)


async def test_delete_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1),
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f'stages/{stage_inserted.id}', auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(stages, 0)


async def test_update_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'type': StageType.ROUND_ROBIN.value, 'is_active': False}
    async with (
        inserted_team(DUMMY_TEAM1),
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.PATCH, f'stages/{stage_inserted.id}', auth_context, None, body
            )
            == SUCCESS_RESPONSE
        )
        [patched_stage] = await get_stages_with_rounds_and_matches(
            assert_some(auth_context.tournament.id)
        )
        assert patched_stage.type.value == body['type']
        assert patched_stage.is_active == body['is_active']

        await assert_row_count_and_clear(stages, 1)
