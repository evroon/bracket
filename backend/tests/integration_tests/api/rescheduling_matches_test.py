from bracket.models.db.match import MatchRescheduleBody
from bracket.schema import matches
from bracket.sql.matches import sql_get_match
from bracket.utils.dummy_records import (
    DUMMY_COURT1,
    DUMMY_COURT2,
    DUMMY_MATCH1,
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
    inserted_round,
    inserted_stage,
    inserted_stage_item,
    inserted_team,
)


async def test_reschedule_match(
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
        inserted_court(
            DUMMY_COURT2.model_copy(update={"tournament_id": auth_context.tournament.id})
        ) as court2_inserted,
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
        body = MatchRescheduleBody(
            old_court_id=assert_some(court1_inserted.id),
            old_position=1,
            new_court_id=assert_some(court2_inserted.id),
            new_position=2,
        )
        assert (
            await send_tournament_request(
                HTTPMethod.POST,
                f"matches/{match_inserted.id}/reschedule",
                auth_context,
                json=body.model_dump(),
            )
            == SUCCESS_RESPONSE
        )
        match = await sql_get_match(assert_some(match_inserted.id))
        await assert_row_count_and_clear(matches, 0)

    assert match.court_id == body.new_court_id
    assert match.position_in_schedule == 0
