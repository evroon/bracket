from datetime import timedelta

from bracket.logic.planning.conflicts import get_conflicting_matches
from bracket.models.db.util import StageWithStageItems
from bracket.utils.dummy_records import DUMMY_MOCK_TIME
from bracket.utils.id_types import StageId, TournamentId
from tests.integration_tests.mocks import MOCK_NOW
from tests.unit_tests.mocks import (
    get_2_definitive_matches_mock,
    get_one_round_with_two_definitive_matches,
    get_stage_item_inputs_mock,
    get_stage_item_mock,
)


def test_get_conflicting_matches_conflicts_to_set() -> None:
    """
    Test `get_conflicting_matches` returns the right conflicts to set
    """
    tournament_id = TournamentId(-1)
    stage_item_inputs = get_stage_item_inputs_mock(tournament_id)
    match1, match2 = get_2_definitive_matches_mock(stage_item_inputs)
    rounds = get_one_round_with_two_definitive_matches(match1, match2)
    stage_item = StageWithStageItems(
        id=StageId(-1),
        tournament_id=tournament_id,
        name="",
        created=MOCK_NOW,
        is_active=False,
        stage_items=[get_stage_item_mock(stage_item_inputs, [rounds])],
    )

    assert get_conflicting_matches([stage_item]) == ({-1: [True, False], -2: [True, False]}, set())


def test_get_conflicting_matches_conflicts_to_clear() -> None:
    """
    Test `get_conflicting_matches` returns the right conflicts to clear
    """
    tournament_id = TournamentId(-1)
    stage_item_inputs = get_stage_item_inputs_mock(tournament_id)
    match1, match2 = get_2_definitive_matches_mock(
        stage_item_inputs, DUMMY_MOCK_TIME + timedelta(hours=1)
    )
    rounds = get_one_round_with_two_definitive_matches(match1, match2)
    stage_item = StageWithStageItems(
        id=StageId(-1),
        tournament_id=tournament_id,
        name="",
        created=MOCK_NOW,
        is_active=False,
        stage_items=[get_stage_item_mock(stage_item_inputs, [rounds])],
    )

    assert get_conflicting_matches([stage_item]) == ({}, {-1, -2})
