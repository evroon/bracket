from bracket.logic.scheduling.builder import build_matches_for_stage_item
from bracket.models.db.stage_item import StageItemCreateBody
from bracket.models.db.stage_item_inputs import (
    StageItemInputCreateBodyFinal,
    StageItemInputCreateBodyTentative,
)
from bracket.schema import matches, rounds, stage_item_inputs, stage_items
from bracket.sql.stage_items import sql_create_stage_item
from bracket.utils.dummy_records import (
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
    inserted_team,
)


async def test_schedule_all_matches(
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
        inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team_inserted_3,
        inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team_inserted_4,
    ):
        stage_item_1 = await sql_create_stage_item(
            assert_some(auth_context.tournament.id),
            StageItemCreateBody(
                stage_id=assert_some(stage_inserted_1.id),
                name=DUMMY_STAGE_ITEM1.name,
                team_count=DUMMY_STAGE_ITEM1.team_count,
                type=DUMMY_STAGE_ITEM1.type,
                inputs=[
                    StageItemInputCreateBodyFinal(
                        slot=1,
                        team_id=assert_some(team_inserted_1.id),
                    ),
                    StageItemInputCreateBodyFinal(
                        slot=2,
                        team_id=assert_some(team_inserted_2.id),
                    ),
                    StageItemInputCreateBodyFinal(
                        slot=3,
                        team_id=assert_some(team_inserted_3.id),
                    ),
                    StageItemInputCreateBodyFinal(
                        slot=4,
                        team_id=assert_some(team_inserted_4.id),
                    ),
                ],
            ),
        )
        await sql_create_stage_item(
            assert_some(auth_context.tournament.id),
            StageItemCreateBody(
                stage_id=assert_some(stage_inserted_1.id),
                name=DUMMY_STAGE_ITEM1.name,
                team_count=2,
                type=DUMMY_STAGE_ITEM1.type,
                inputs=[
                    StageItemInputCreateBodyTentative(
                        slot=1,
                        winner_from_stage_item_id=stage_item_1.id,
                        winner_position=1,
                    ),
                    StageItemInputCreateBodyTentative(
                        slot=2,
                        winner_from_stage_item_id=stage_item_1.id,
                        winner_position=2,
                    ),
                ],
            ),
        )

        await build_matches_for_stage_item(stage_item_1, assert_some(auth_context.tournament.id))

        await assert_row_count_and_clear(matches, 1)
        await assert_row_count_and_clear(rounds, 1)
        await assert_row_count_and_clear(stage_item_inputs, 1)
        await assert_row_count_and_clear(stage_items, 1)

    assert (
        await send_tournament_request(
            HTTPMethod.POST,
            'schedule_matches',
            auth_context,
        )
        == SUCCESS_RESPONSE
    )
