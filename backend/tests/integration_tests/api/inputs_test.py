from bracket.utils.dummy_records import (
    DUMMY_STAGE1,
    DUMMY_STAGE_ITEM1,
    DUMMY_TEAM1,
)
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import (
    send_tournament_request,
)
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    inserted_stage,
    inserted_stage_item,
    inserted_team,
)


async def test_available_inputs(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team_inserted,
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted_1,
        # inserted_stage(
        #     DUMMY_STAGE2.model_copy(update={'tournament_id': auth_context.tournament.id})
        # ) as stage_inserted_2,
        inserted_stage_item(DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted_1.id})),
    ):
        response = await send_tournament_request(
            HTTPMethod.GET, f"stages/{stage_inserted_1.id}/available_inputs", auth_context
        )

    assert response == {
        "data": [
            {"team_id": team_inserted.id},
            # {'winner_from_stage_item_id': 1, 'winner_position': 1},
            # {'winner_from_stage_item_id': 1, 'winner_position': 2},
        ]
    }
