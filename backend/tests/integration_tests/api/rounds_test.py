from bracket.database import database
from bracket.models.db.round import Round
from bracket.models.db.stage_item import StageType
from bracket.schema import rounds
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_ROUND1, DUMMY_STAGE1, DUMMY_STAGE_ITEM1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    assert_row_count_and_clear,
    inserted_round,
    inserted_stage,
    inserted_stage_item,
    inserted_team,
)


async def test_create_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_team(DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})),
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={"stage_id": stage_inserted.id, "type": StageType.SWISS}
            )
        ) as stage_item_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.POST,
                "rounds",
                auth_context,
                json={"stage_item_id": stage_item_inserted.id},
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(rounds, 1)


async def test_delete_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
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
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f"rounds/{round_inserted.id}", auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(rounds, 0)


async def test_update_round(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Some new name", "is_draft": True, "is_active": False}
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
        assert (
            await send_tournament_request(
                HTTPMethod.PUT, f"rounds/{round_inserted.id}", auth_context, None, body
            )
            == SUCCESS_RESPONSE
        )
        updated_round = await fetch_one_parsed_certain(
            database, Round, query=rounds.select().where(rounds.c.id == round_inserted.id)
        )
        assert updated_round.name == body["name"]
        assert updated_round.is_draft == body["is_draft"]
        assert updated_round.is_active == body["is_active"]

        await assert_row_count_and_clear(rounds, 1)
