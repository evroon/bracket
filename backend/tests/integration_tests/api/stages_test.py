import pytest

from bracket.schema import rounds, stage_items, stages
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.dummy_records import (
    DUMMY_MOCK_TIME,
    DUMMY_ROUND1,
    DUMMY_STAGE1,
    DUMMY_STAGE2,
    DUMMY_STAGE_ITEM1,
    DUMMY_TEAM1,
)
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
    inserted_stage_item,
    inserted_team,
)


@pytest.mark.parametrize(("with_auth",), [(True,), (False,)])
async def test_stages_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext, with_auth: bool
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted.id})
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(update={"stage_item_id": stage_item_inserted.id})
        ) as round_inserted,
    ):
        if with_auth:
            response = await send_tournament_request(HTTPMethod.GET, "stages", auth_context, {})
        else:
            response = await send_request(
                HTTPMethod.GET,
                f"tournaments/{auth_context.tournament.id}/stages?no_draft_rounds=true",
            )
        assert response == {
            "data": [
                {
                    "id": stage_inserted.id,
                    "tournament_id": auth_context.tournament.id,
                    "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                    "is_active": True,
                    "name": "Group Stage",
                    "stage_items": [
                        {
                            "id": stage_item_inserted.id,
                            "stage_id": stage_inserted.id,
                            "name": "Group A",
                            "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                            "type": "ROUND_ROBIN",
                            "team_count": 4,
                            "rounds": [
                                {
                                    "id": round_inserted.id,
                                    "stage_item_id": stage_item_inserted.id,
                                    "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                                    "is_draft": False,
                                    "is_active": False,
                                    "name": "Round 1",
                                    "matches": [],
                                }
                            ],
                            "inputs": [],
                            "type_name": "Round robin",
                        }
                    ],
                }
            ]
        }


async def test_create_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.POST,
                "stages",
                auth_context,
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(rounds, 1)
        await assert_row_count_and_clear(stage_items, 1)
        await assert_row_count_and_clear(stages, 1)


async def test_delete_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f"stages/{stage_inserted.id}", auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(stages, 0)


async def test_update_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Optimus"}
    async with (
        inserted_team(DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted.id})),
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.PUT, f"stages/{stage_inserted.id}", auth_context, None, body
            )
            == SUCCESS_RESPONSE
        )
        [updated_stage] = await get_full_tournament_details(assert_some(auth_context.tournament.id))
        assert len(updated_stage.stage_items) == 1
        assert updated_stage.name == body["name"]

        await assert_row_count_and_clear(stage_items, 1)
        await assert_row_count_and_clear(stages, 1)


async def test_activate_stage(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ),
        inserted_stage(
            DUMMY_STAGE2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ),
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.POST, "stages/activate?direction=next", auth_context, json={}
            )
            == SUCCESS_RESPONSE
        )
        [prev_stage, next_stage] = await get_full_tournament_details(
            assert_some(auth_context.tournament.id)
        )
        assert prev_stage.is_active is False
        assert next_stage.is_active is True

        await assert_row_count_and_clear(stage_items, 1)
        await assert_row_count_and_clear(stages, 1)
