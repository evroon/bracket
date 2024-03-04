from decimal import Decimal

from bracket.database import database
from bracket.models.db.match import Match
from bracket.models.db.stage_item import StageType
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
from bracket.utils.types import assert_some
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
    inserted_team,
)


async def test_create_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted.id})
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(update={"stage_item_id": stage_item_inserted.id})
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
        assert response["data"]["id"]

        await assert_row_count_and_clear(matches, 1)


async def test_delete_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted.id})
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
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_match(
            DUMMY_MATCH1.model_copy(
                update={
                    "round_id": round_inserted.id,
                    "team1_id": team1_inserted.id,
                    "team2_id": team2_inserted.id,
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


async def test_update_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(
            DUMMY_STAGE1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as stage_inserted,
        inserted_stage_item(
            DUMMY_STAGE_ITEM1.model_copy(update={"stage_id": stage_inserted.id})
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
        inserted_court(
            DUMMY_COURT1.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court1_inserted,
        inserted_match(
            DUMMY_MATCH1.model_copy(
                update={
                    "round_id": round_inserted.id,
                    "team1_id": team1_inserted.id,
                    "team2_id": team2_inserted.id,
                    "court_id": court1_inserted.id,
                }
            )
        ) as match_inserted,
    ):
        body = {
            "team1_score": 42,
            "team2_score": 24,
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
        assert updated_match.team1_score == body["team1_score"]
        assert updated_match.team2_score == body["team2_score"]
        assert updated_match.court_id == body["court_id"]

        await assert_row_count_and_clear(matches, 1)


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
                update={"stage_id": stage_inserted.id, "type": StageType.SWISS}
            )
        ) as stage_item_inserted,
        inserted_round(
            DUMMY_ROUND1.model_copy(
                update={
                    "is_draft": True,
                    "stage_item_id": stage_item_inserted.id,
                }
            )
        ) as round_inserted,
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
        inserted_player_in_team(
            DUMMY_PLAYER1.model_copy(
                update={"elo_score": Decimal("1100.0"), "tournament_id": auth_context.tournament.id}
            ),
            assert_some(team1_inserted.id),
        ) as player_inserted_1,
        inserted_player_in_team(
            DUMMY_PLAYER2.model_copy(
                update={"elo_score": Decimal("1300.0"), "tournament_id": auth_context.tournament.id}
            ),
            assert_some(team2_inserted.id),
        ) as player_inserted_2,
        inserted_player_in_team(
            DUMMY_PLAYER3.model_copy(
                update={"elo_score": Decimal("1200.0"), "tournament_id": auth_context.tournament.id}
            ),
            assert_some(team1_inserted.id),
        ) as player_inserted_3,
        inserted_player_in_team(
            DUMMY_PLAYER4.model_copy(
                update={"elo_score": Decimal("1400.0"), "tournament_id": auth_context.tournament.id}
            ),
            assert_some(team2_inserted.id),
        ) as player_inserted_4,
    ):
        json_response = await send_tournament_request(
            HTTPMethod.GET, f"rounds/{round_inserted.id}/upcoming_matches", auth_context, {}
        )
        assert json_response == {
            "data": [
                {
                    "team1": {
                        "id": team1_inserted.id,
                        "name": team1_inserted.name,
                        "players": [
                            {
                                "id": player_inserted_1.id,
                                "active": True,
                                "name": "Player 01",
                                "created": "2022-01-11T04:32:11Z",
                                "tournament_id": auth_context.tournament.id,
                                "elo_score": "1100",
                                "swiss_score": "0",
                                "wins": 0,
                                "draws": 0,
                                "losses": 0,
                            },
                            {
                                "id": player_inserted_3.id,
                                "active": True,
                                "name": "Player 03",
                                "created": "2022-01-11T04:32:11Z",
                                "tournament_id": auth_context.tournament.id,
                                "elo_score": "1200",
                                "swiss_score": "0",
                                "wins": 0,
                                "draws": 0,
                                "losses": 0,
                            },
                        ],
                        "swiss_score": "0.0",
                        "elo_score": "1150.0",
                        "wins": 0,
                        "draws": 0,
                        "losses": 0,
                        "logo_path": None,
                    },
                    "team2": {
                        "id": team2_inserted.id,
                        "name": team2_inserted.name,
                        "players": [
                            {
                                "id": player_inserted_2.id,
                                "active": True,
                                "name": "Player 02",
                                "created": "2022-01-11T04:32:11Z",
                                "tournament_id": auth_context.tournament.id,
                                "elo_score": "1300",
                                "swiss_score": "0",
                                "wins": 0,
                                "draws": 0,
                                "losses": 0,
                            },
                            {
                                "id": player_inserted_4.id,
                                "active": True,
                                "name": "Player 04",
                                "created": "2022-01-11T04:32:11Z",
                                "tournament_id": auth_context.tournament.id,
                                "elo_score": "1400",
                                "swiss_score": "0",
                                "wins": 0,
                                "draws": 0,
                                "losses": 0,
                            },
                        ],
                        "swiss_score": "0.0",
                        "elo_score": "1350.0",
                        "wins": 0,
                        "draws": 0,
                        "losses": 0,
                        "logo_path": None,
                    },
                    "elo_diff": "200",
                    "swiss_diff": "0",
                    "is_recommended": True,
                    "player_behind_schedule_count": 0,
                }
            ]
        }
