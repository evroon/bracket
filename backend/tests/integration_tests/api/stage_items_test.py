from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import StageItemInputCreateBodyFinal
from bracket.schema import rounds, stage_items, stages, matches
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.dummy_records import (
    DUMMY_STAGE1,
    DUMMY_STAGE2,
    DUMMY_STAGE_ITEM1,
    DUMMY_TEAM1,
)
from bracket.utils.http import HTTPMethod
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import (
    SUCCESS_RESPONSE,
    send_tournament_request,
)
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    assert_row_count_and_clear,
    inserted_stage,
    inserted_stage_item,
    inserted_team,
)


async def test_create_stage_item(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE2.copy(update={'tournament_id': auth_context.tournament.id})
        ) as stage_inserted_1,
        inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team_inserted_1,
        inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team_inserted_2,
    ):
        assert team_inserted_1.id and team_inserted_2.id
        inputs = [
            StageItemInputCreateBodyFinal(slot=1, team_id=team_inserted_1.id).dict(),
            StageItemInputCreateBodyFinal(slot=2, team_id=team_inserted_2.id).dict(),
        ]
        assert (
            await send_tournament_request(
                HTTPMethod.POST,
                'stage_items',
                auth_context,
                json={
                    'type': StageType.SINGLE_ELIMINATION.value,
                    'team_count': 2,
                    'stage_id': stage_inserted_1.id,
                    'inputs': inputs,
                },
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(matches, 1)
        await assert_row_count_and_clear(rounds, 1)
        await assert_row_count_and_clear(stage_items, 1)
        await assert_row_count_and_clear(stages, 1)


async def test_delete_stage_item(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE2.copy(update={'tournament_id': auth_context.tournament.id})
        ) as stage_inserted_1,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.copy(update={'stage_id': stage_inserted_1.id})
        ) as stage_item_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f'stage_items/{stage_item_inserted.id}', auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(stages, 0)


async def test_update_stage_item(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Optimus'}
    async with (
        inserted_team(DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(DUMMY_STAGE_ITEM1.copy(update={'stage_id': stage_inserted.id})),
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.PUT, f'stage_items/{stage_inserted.id}', auth_context, None, body
            )
            == SUCCESS_RESPONSE
        )
        [updated_stage] = await get_full_tournament_details(assert_some(auth_context.tournament.id))
        assert len(updated_stage.stage_items) == 1
        assert updated_stage.name == body['name']

        await assert_row_count_and_clear(stage_items, 1)
        await assert_row_count_and_clear(stages, 1)
