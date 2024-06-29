from decimal import Decimal
from unittest.mock import ANY

from bracket.database import database
from bracket.models.db.ranking import Ranking
from bracket.schema import rankings
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_RANKING1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear, inserted_ranking, inserted_team


async def test_rankings_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_ranking(
            DUMMY_RANKING1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as ranking_inserted:
            assert await send_tournament_request(HTTPMethod.GET, "rankings", auth_context, {}) == {
                "data": [
                    {
                        "created": ANY,
                        "id": ranking_inserted.id,
                        "position": 0,
                        "win_points": "3.0",
                        "draw_points": "1.0",
                        "loss_points": "0.0",
                        "tournament_id": auth_context.tournament.id,
                    }
                ],
            }


async def test_create_ranking(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    response = await send_tournament_request(HTTPMethod.POST, "rankings", auth_context, json={})
    assert response.get("success") is True, response
    await assert_row_count_and_clear(rankings, 1)


async def test_delete_ranking(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_ranking(
            DUMMY_RANKING1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as ranking_inserted:
            assert (
                await send_tournament_request(
                    HTTPMethod.DELETE, f"rankings/{ranking_inserted.id}", auth_context
                )
                == SUCCESS_RESPONSE
            )
            await assert_row_count_and_clear(rankings, 0)


async def test_update_ranking(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"win_points": "7.5", "draw_points": "2.5", "loss_points": "6.0", "position": 42}
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        async with inserted_ranking(
            DUMMY_RANKING1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as ranking_inserted:
            response = await send_tournament_request(
                HTTPMethod.PUT, f"rankings/{ranking_inserted.id}", auth_context, json=body
            )
            updated_ranking = await fetch_one_parsed_certain(
                database,
                Ranking,
                query=rankings.select().where(rankings.c.id == ranking_inserted.id),
            )
            assert response["success"] is True
            assert updated_ranking.win_points == Decimal("7.5")
            await assert_row_count_and_clear(rankings, 1)
