from bracket.database import database
from bracket.models.db.court import Court
from bracket.schema import courts
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_COURT1, DUMMY_MOCK_TIME, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear, inserted_court, inserted_team


async def test_courts_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court_inserted:
            assert await send_tournament_request(HTTPMethod.GET, "courts", auth_context, {}) == {
                "data": [
                    {
                        "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                        "id": court_inserted.id,
                        "name": "Court 1",
                        "tournament_id": auth_context.tournament.id,
                    }
                ],
            }


async def test_create_court(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Some new name", "active": True}
    response = await send_tournament_request(HTTPMethod.POST, "courts", auth_context, json=body)
    assert response["data"]["name"] == body["name"]
    await assert_row_count_and_clear(courts, 1)


async def test_delete_court(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.DELETE, f"courts/{court_inserted.id}", auth_context
                )
                == SUCCESS_RESPONSE
            )
            await assert_row_count_and_clear(courts, 0)


async def test_update_court(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"name": "Some new name"}
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court_inserted:
            response = await send_tournament_request(
                HTTPMethod.PUT, f"courts/{court_inserted.id}", auth_context, json=body
            )
            updated_court = await fetch_one_parsed_certain(
                database, Court, query=courts.select().where(courts.c.id == court_inserted.id)
            )
            assert updated_court.name == body["name"]
            assert response["data"]["name"] == body["name"]

            await assert_row_count_and_clear(courts, 1)
