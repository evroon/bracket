from bracket.models.db.round import RoundToInsert
from bracket.models.db.stage_item import StageItemCreateBody, StageType
from bracket.models.db.stage_item_inputs import (
    StageItemInputCreateBodyFinal,
)
from bracket.sql.rounds import sql_create_round
from bracket.sql.shared import sql_delete_stage_item_with_foreign_keys
from bracket.sql.stage_items import sql_create_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.dummy_records import (
    DUMMY_COURT1,
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
    inserted_court,
    inserted_stage,
    inserted_team,
)


async def test_schedule_matches_auto(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ),
        inserted_stage(
            DUMMY_STAGE2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted_1,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team_inserted_1,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team_inserted_2,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team_inserted_3,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team_inserted_4,
    ):
        tournament_id = assert_some(auth_context.tournament.id)
        stage_item_1 = await sql_create_stage_item(
            tournament_id,
            StageItemCreateBody(
                stage_id=assert_some(stage_inserted_1.id),
                name=DUMMY_STAGE_ITEM1.name,
                team_count=DUMMY_STAGE_ITEM1.team_count,
                type=StageType.SWISS,
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
        await sql_create_round(
            RoundToInsert(stage_item_id=stage_item_1.id, name="", is_draft=False, is_active=True),
        )
        round_2_id = await sql_create_round(
            RoundToInsert(stage_item_id=stage_item_1.id, name="", is_draft=True, is_active=False),
        )

        response = await send_tournament_request(
            HTTPMethod.POST,
            f"rounds/{round_2_id}/schedule_auto",
            auth_context,
        )
        stages = await get_full_tournament_details(tournament_id)

        await sql_delete_stage_item_with_foreign_keys(stage_item_1.id)

    assert response == SUCCESS_RESPONSE

    stage_item = stages[0].stage_items[0]
    assert len(stage_item.rounds) == 2
    assert len(stage_item.rounds[0].matches) == 1
    assert len(stage_item.rounds[1].matches) == 0
