from decimal import Decimal

import pytest

from bracket.database import database
from bracket.models.db.match import Match
from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import (
    StageItemInputInsertable,
)
from bracket.schema import matches
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import (
    DUMMY_COURT1,
    DUMMY_MATCH1,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_ROUND1,
    DUMMY_STAGE1,
    DUMMY_STAGE_ITEM1,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
)
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    assert_row_count_and_clear,
    inserted_court,
    inserted_match,
    inserted_player_in_team,
    inserted_round,
    inserted_stage,
    inserted_stage_item,
    inserted_stage_item_input,
    inserted_team,
)


@pytest.mark.asyncio(loop_scope="session")
async def test_create_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={
                    "stage_id": stage_inserted.id,
                    "ranking_id": auth_context.ranking.id,
                    "type": StageType.SWISS,
                }
            )
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(
                update={"stage_item_id": stage_item_inserted.id, "is_draft": True}
            )
        ) as round_inserted,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team1_inserted,
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_team(
            DUMMY_TEAM2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team2_inserted,
    ):
        body = {
            "team1_id": team1_inserted.id,
            "team2_id": team2_inserted.id,
            "round_id": round_inserted.id,
            "court_id": court1_inserted.id,
        }
        response = await send_tournament_request(
            HTTPMethod.POST, "matches", auth_context, json=body
        )
        assert response["data"]["id"], response

        await assert_row_count_and_clear(matches, 1)


@pytest.mark.asyncio(loop_scope="session")
async def test_delete_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={
                    "stage_id": stage_inserted.id,
                    "ranking_id": auth_context.ranking.id,
                    "type": StageType.SWISS,
                }
            )
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(
                update={"stage_item_id": stage_item_inserted.id, "is_draft": True}
            )
        ) as round_inserted,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team1_inserted,
        inserted_team(
            DUMMY_TEAM2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team2_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=0,
                team_id=team1_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input1_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=1,
                team_id=team2_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input2_inserted,
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_match(
            DUMMY_MATCH1.model_copy(
                update={
                    "round_id": round_inserted.id,
                    "stage_item_input1_id": stage_item_input1_inserted.id,
                    "stage_item_input2_id": stage_item_input2_inserted.id,
                    "court_id": court1_inserted.id,
                }
            )
        ) as match_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f"matches/{match_inserted.id}", auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(matches, 0)


@pytest.mark.asyncio(loop_scope="session")
async def test_update_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={"stage_id": stage_inserted.id, "ranking_id": auth_context.ranking.id}
            )
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(update={"stage_item_id": stage_item_inserted.id})
        ) as round_inserted,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team1_inserted,
        inserted_team(
            DUMMY_TEAM2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team2_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=0,
                team_id=team1_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input1_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=1,
                team_id=team2_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input2_inserted,
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_match(
            DUMMY_MATCH1.model_copy(
                update={
                    "round_id": round_inserted.id,
                    "stage_item_input1_id": stage_item_input1_inserted.id,
                    "stage_item_input2_id": stage_item_input2_inserted.id,
                    "court_id": court1_inserted.id,
                }
            )
        ) as match_inserted,
    ):
        body = {
            "stage_item_input1_score": 42,
            "stage_item_input2_score": 24,
            "round_id": round_inserted.id,
            "court_id": None,
        }
        assert (
            await send_tournament_request(
                HTTPMethod.PUT,
                f"matches/{match_inserted.id}",
                auth_context,
                None,
                body,
            )
            == SUCCESS_RESPONSE
        )
        updated_match = await fetch_one_parsed_certain(
            database,
            Match,
            query=matches.select().where(matches.c.id == match_inserted.id),
        )
        assert updated_match.stage_item_input1_score == body["stage_item_input1_score"]
        assert updated_match.stage_item_input2_score == body["stage_item_input2_score"]
        assert updated_match.court_id == body["court_id"]

        await assert_row_count_and_clear(matches, 1)


@pytest.mark.asyncio(loop_scope="session")
async def test_update_endpoint_custom_duration_margin(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={"stage_id": stage_inserted.id, "ranking_id": auth_context.ranking.id}
            )
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(update={"stage_item_id": stage_item_inserted.id})
        ) as round_inserted,
        inserted_team(
            DUMMY_TEAM1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team1_inserted,
        inserted_team(
            DUMMY_TEAM2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as team2_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=0,
                team_id=team1_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input1_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=1,
                team_id=team2_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input2_inserted,
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_match(
            DUMMY_MATCH1.model_copy(
                update={
                    "round_id": round_inserted.id,
                    "stage_item_input1_id": stage_item_input1_inserted.id,
                    "stage_item_input2_id": stage_item_input2_inserted.id,
                    "court_id": court1_inserted.id,
                    "custom_duration_minutes": 20,
                    "custom_margin_minutes": 10,
                }
            )
        ) as match_inserted,
    ):
        body = {
            "round_id": round_inserted.id,
            "custom_duration_minutes": 30,
            "custom_margin_minutes": 20,
        }
        assert (
            await send_tournament_request(
                HTTPMethod.PUT,
                f"matches/{match_inserted.id}",
                auth_context,
                None,
                body,
            )
            == SUCCESS_RESPONSE
        )
        updated_match = await fetch_one_parsed_certain(
            database,
            Match,
            query=matches.select().where(matches.c.id == match_inserted.id),
        )
        assert updated_match.custom_duration_minutes == body["custom_duration_minutes"]
        assert updated_match.custom_margin_minutes == body["custom_margin_minutes"]

        await assert_row_count_and_clear(matches, 1)


@pytest.mark.asyncio(loop_scope="session")
async def test_upcoming_matches_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(
                update={
                    "is_active": True,
                    "tournament_id": auth_context.tournament.id,
                }
            )
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(
                update={
                    "stage_id": stage_inserted.id,
                    "type": StageType.SWISS,
                    "ranking_id": auth_context.ranking.id,
                }
            )
        ) as stage_item_inserted,
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ),
        inserted_round(
            DUMMY_ROUND1.model_copy(
                update={
                    "is_draft": True,
                    "stage_item_id": stage_item_inserted.id,
                }
            )
        ),
        inserted_team(
            DUMMY_TEAM1.model_copy(
                update={"tournament_id": auth_context.tournament.id, "elo_score": Decimal("1150.0")}
            )
        ) as team1_inserted,
        inserted_team(
            DUMMY_TEAM2.model_copy(
                update={"tournament_id": auth_context.tournament.id, "elo_score": Decimal("1350.0")}
            )
        ) as team2_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=0,
                team_id=team1_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input1_inserted,
        inserted_stage_item_input(
            StageItemInputInsertable(
                slot=1,
                team_id=team2_inserted.id,
                tournament_id=auth_context.tournament.id,
                stage_item_id=stage_item_inserted.id,
            )
        ) as stage_item_input2_inserted,
        inserted_player_in_team(
            DUMMY_PLAYER1.model_copy(
                update={"elo_score": Decimal("1100.0"), "tournament_id": auth_context.tournament.id}
            ),
            team1_inserted.id,
        ),
        inserted_player_in_team(
            DUMMY_PLAYER2.model_copy(
                update={"elo_score": Decimal("1300.0"), "tournament_id": auth_context.tournament.id}
            ),
            team2_inserted.id,
        ),
        inserted_player_in_team(
            DUMMY_PLAYER3.model_copy(
                update={"elo_score": Decimal("1200.0"), "tournament_id": auth_context.tournament.id}
            ),
            team1_inserted.id,
        ),
        inserted_player_in_team(
            DUMMY_PLAYER4.model_copy(
                update={"elo_score": Decimal("1400.0"), "tournament_id": auth_context.tournament.id}
            ),
            team2_inserted.id,
        ),
    ):
        json_response = await send_tournament_request(
            HTTPMethod.GET,
            f"stage_items/{stage_item_inserted.id}/upcoming_matches",
            auth_context,
            {},
        )
        # print(json_response["data"][0]["stage_item_input1"]["team"])
        # 1 / 0
        assert json_response == {
            "data": [
                {
                    "stage_item_input1": {
                        "team_id": team1_inserted.id,
                        "winner_from_stage_item_id": None,
                        "winner_position": None,
                        "points": "0",
                        "wins": 0,
                        "draws": 0,
                        "losses": 0,
                        "id": stage_item_input1_inserted.id,
                        "slot": 0,
                        "tournament_id": auth_context.tournament.id,
                        "stage_item_id": stage_item_inserted.id,
                        "team": {
                            "created": "2022-01-11T04:32:11Z",
                            "name": team1_inserted.name,
                            "tournament_id": auth_context.tournament.id,
                            "active": True,
                            "elo_score": "1150",
                            "swiss_score": "0",
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "logo_path": None,
                            "id": team1_inserted.id,
                        },
                    },
                    "stage_item_input2": {
                        "team_id": team2_inserted.id,
                        "winner_from_stage_item_id": None,
                        "winner_position": None,
                        "points": "0",
                        "wins": 0,
                        "draws": 0,
                        "losses": 0,
                        "id": stage_item_input2_inserted.id,
                        "slot": 1,
                        "tournament_id": auth_context.tournament.id,
                        "stage_item_id": stage_item_inserted.id,
                        "team": {
                            "created": "2022-01-11T04:32:11Z",
                            "name": team2_inserted.name,
                            "tournament_id": auth_context.tournament.id,
                            "active": True,
                            "elo_score": "1350",
                            "swiss_score": "0",
                            "wins": 0,
                            "draws": 0,
                            "losses": 0,
                            "logo_path": None,
                            "id": team2_inserted.id,
                        },
                    },
                    "elo_diff": "0",
                    "swiss_diff": "0",
                    "times_played_sum": 0,
                    "is_recommended": True,
                    "player_behind_schedule_count": 0,
                }
            ]
        }
