from datetime import timedelta

import pytest

from bracket.logic.planning.rounds import (
    MatchTimingAdjustmentInfeasible,
    get_all_scheduling_operations_for_swiss_round,
)
from bracket.models.db.match import MatchWithDetails, MatchWithDetailsDefinitive
from bracket.models.db.tournament import Tournament
from bracket.models.db.util import StageWithStageItems
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TOURNAMENT
from bracket.utils.id_types import CourtId, StageId, TournamentId
from tests.integration_tests.mocks import MOCK_NOW
from tests.unit_tests.mocks import (
    get_2_definitive_and_2_tentative_matches_mock,
    get_one_round_with_two_definitive_matches,
    get_stage_item_inputs_mock,
    get_stage_item_mock,
    get_two_round_with_one_tentative_match_each,
)


def _setup_tournament() -> tuple[
    Tournament,
    StageWithStageItems,
    tuple[
        MatchWithDetailsDefinitive, MatchWithDetailsDefinitive, MatchWithDetails, MatchWithDetails
    ],
]:
    tournament = Tournament(**DUMMY_TOURNAMENT.model_dump(), id=TournamentId(-1))
    stage_item_inputs = get_stage_item_inputs_mock(tournament.id)
    matches = get_2_definitive_and_2_tentative_matches_mock(stage_item_inputs)
    rounds = [
        get_one_round_with_two_definitive_matches(matches[0], matches[1]),
        *get_two_round_with_one_tentative_match_each(matches[2], matches[3]),
    ]
    stage = StageWithStageItems(
        id=StageId(-1),
        tournament_id=tournament.id,
        name="",
        created=MOCK_NOW,
        is_active=False,
        stage_items=[get_stage_item_mock(stage_item_inputs, rounds)],
    )
    return tournament, stage, matches


def test_rescheduling_swiss() -> None:
    """
    Test `get_all_scheduling_operations_for_swiss_round`
    """
    tournament, stage, (_, _, match3, match4) = _setup_tournament()
    court_ids = [CourtId(-1), CourtId(-2)]

    assert get_all_scheduling_operations_for_swiss_round(
        court_ids, [stage], tournament, [match3, match4], None
    ) == [
        (CourtId(-1), DUMMY_MOCK_TIME + timedelta(minutes=105), 2, match3, tournament),
        (CourtId(-2), DUMMY_MOCK_TIME + timedelta(minutes=105), 2, match4, tournament),
    ]


def test_rescheduling_swiss_with_time_adjustment() -> None:
    """
    Test `get_all_scheduling_operations_for_swiss_round` with `adjust_to_time` parameter
    """
    tournament, stage, (match1, match2, match3, match4) = _setup_tournament()
    court_ids = [CourtId(-1), CourtId(-2)]
    adjust_to_time = DUMMY_MOCK_TIME + timedelta(minutes=120)

    assert get_all_scheduling_operations_for_swiss_round(
        court_ids, [stage], tournament, [match3, match4], adjust_to_time
    ) == [
        (
            CourtId(-1),
            DUMMY_MOCK_TIME,
            1,
            match1.model_copy(update={"custom_margin_minutes": 30}),
            tournament,
        ),
        (CourtId(-1), adjust_to_time, 2, match3, tournament),
        (
            CourtId(-2),
            DUMMY_MOCK_TIME,
            1,
            match2.model_copy(update={"custom_margin_minutes": 30}),
            tournament,
        ),
        (CourtId(-2), adjust_to_time, 2, match4, tournament),
    ]


def test_rescheduling_swiss_with_time_adjustment_infeasible() -> None:
    """
    Test `get_all_scheduling_operations_for_swiss_round` with `adjust_to_time` parameter
    """
    tournament, stage, (_, _, match3, match4) = _setup_tournament()
    court_ids = [CourtId(-1), CourtId(-2)]

    with pytest.raises(MatchTimingAdjustmentInfeasible):
        get_all_scheduling_operations_for_swiss_round(
            court_ids,
            [stage],
            tournament,
            [match3, match4],
            DUMMY_MOCK_TIME - timedelta(minutes=10),
        )


def test_rescheduling_swiss_no_courts() -> None:
    """
    Test `get_all_scheduling_operations_for_swiss_round` when there are no courts
    """
    tournament, stage, (match1, match2, _, _) = _setup_tournament()

    assert not get_all_scheduling_operations_for_swiss_round(
        [], [stage], tournament, [match1, match2], None
    )
