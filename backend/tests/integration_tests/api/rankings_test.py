from decimal import Decimal
from unittest.mock import ANY

import pytest

from bracket.database import database
from bracket.models.db.ranking import Ranking
from bracket.schema import rankings
from bracket.sql.rankings import (
    get_all_rankings_in_tournament,
    sql_delete_ranking,
)
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import DUMMY_RANKING1, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_ranking, inserted_team


@pytest.mark.asyncio(loop_scope="session")
async def test_rankings_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(
        DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
    ):
        assert await send_tournament_request(HTTPMethod.GET, "rankings", auth_context, {}) == {
            "data": [
                {
                    "created": ANY,
                    "id": auth_context.ranking.id,
                    "position": 0,
                    "win_points": "1.0",
                    "draw_points": "0.5",
                    "loss_points": "0.0",
                    "add_score_points": False,
                    "tournament_id": auth_context.tournament.id,
                }
            ],
        }


@pytest.mark.asyncio(loop_scope="session")
async def test_create_ranking(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    response = await send_tournament_request(HTTPMethod.POST, "rankings", auth_context, json={})
    assert response.get("success") is True, response

    tournament_id = auth_context.tournament.id
    for ranking in await get_all_rankings_in_tournament(tournament_id):
        if ranking.position != 0:
            await sql_delete_ranking(tournament_id, ranking.id)


@pytest.mark.asyncio(loop_scope="session")
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


@pytest.mark.asyncio(loop_scope="session")
async def test_update_ranking(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {
        "win_points": "7.5",
        "draw_points": "2.5",
        "loss_points": "6.0",
        "add_score_points": True,
        "position": 42,
    }
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
