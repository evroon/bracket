from heliclockter import datetime_utc

from bracket.models.db.match import MatchWithDetails, MatchWithDetailsDefinitive
from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import StageItemInputFinal
from bracket.models.db.team import Team
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.utils.dummy_records import (
    DUMMY_MOCK_TIME,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
    DUMMY_TEAM3,
    DUMMY_TEAM4,
)
from bracket.utils.id_types import (
    CourtId,
    MatchId,
    RoundId,
    StageId,
    StageItemId,
    StageItemInputId,
    TeamId,
    TournamentId,
)


def get_stage_item_inputs_mock(tournament_id: TournamentId) -> list[StageItemInputFinal]:
    return [
        StageItemInputFinal(
            id=StageItemInputId(-1),
            team_id=TeamId(-1),
            slot=1,
            tournament_id=tournament_id,
            team=Team(**DUMMY_TEAM1.model_dump(), id=TeamId(-1)),
        ),
        StageItemInputFinal(
            id=StageItemInputId(-2),
            team_id=TeamId(-2),
            slot=2,
            tournament_id=tournament_id,
            team=Team(**DUMMY_TEAM2.model_dump(), id=TeamId(-2)),
        ),
        StageItemInputFinal(
            id=StageItemInputId(-1),
            team_id=TeamId(-1),
            slot=3,
            tournament_id=tournament_id,
            team=Team(**DUMMY_TEAM3.model_dump(), id=TeamId(-3)),
        ),
        StageItemInputFinal(
            id=StageItemInputId(-4),
            team_id=TeamId(-4),
            slot=4,
            tournament_id=tournament_id,
            team=Team(**DUMMY_TEAM4.model_dump(), id=TeamId(-4)),
        ),
    ]


def get_2_definitive_matches_mock(
    stage_item_inputs: list[StageItemInputFinal], match1_start_time: datetime_utc = DUMMY_MOCK_TIME
) -> tuple[MatchWithDetailsDefinitive, MatchWithDetailsDefinitive]:
    match1 = MatchWithDetailsDefinitive(
        id=MatchId(-1),
        stage_item_input1=stage_item_inputs[0],
        stage_item_input2=stage_item_inputs[1],
        stage_item_input1_id=stage_item_inputs[0].id,
        stage_item_input2_id=stage_item_inputs[1].id,
        created=DUMMY_MOCK_TIME,
        start_time=match1_start_time,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-3),
        court_id=CourtId(-1),
        stage_item_input1_score=2,
        stage_item_input2_score=0,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
        position_in_schedule=1,
    )
    match2 = MatchWithDetailsDefinitive(
        id=MatchId(-2),
        stage_item_input1=stage_item_inputs[2],
        stage_item_input2=stage_item_inputs[3],
        stage_item_input1_id=stage_item_inputs[2].id,
        stage_item_input2_id=stage_item_inputs[3].id,
        created=DUMMY_MOCK_TIME,
        start_time=DUMMY_MOCK_TIME,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-3),
        court_id=CourtId(-2),
        stage_item_input1_score=2,
        stage_item_input2_score=3,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
        position_in_schedule=1,
    )
    return match1, match2


def get_2_definitive_and_2_tentative_matches_mock(
    stage_item_inputs: list[StageItemInputFinal],
) -> tuple[
    MatchWithDetailsDefinitive, MatchWithDetailsDefinitive, MatchWithDetails, MatchWithDetails
]:
    match1, match2 = get_2_definitive_matches_mock(stage_item_inputs)
    match3 = MatchWithDetails(
        id=MatchId(-3),
        created=DUMMY_MOCK_TIME,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-2),
        stage_item_input1_score=4,
        stage_item_input2_score=0,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
        stage_item_input1_winner_from_match_id=match1.id,
        stage_item_input2_winner_from_match_id=match2.id,
    )
    match4 = MatchWithDetails(
        id=MatchId(-4),
        created=DUMMY_MOCK_TIME,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-1),
        stage_item_input1_score=3,
        stage_item_input2_score=2,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
        stage_item_input1_winner_from_match_id=match2.id,
        stage_item_input2_winner_from_match_id=match3.id,
    )
    return match1, match2, match3, match4


def get_one_round_with_two_definitive_matches(
    match1: MatchWithDetailsDefinitive, match2: MatchWithDetailsDefinitive
) -> RoundWithMatches:
    return RoundWithMatches(
        id=RoundId(-3),
        matches=[match1, match2],
        stage_item_id=StageItemId(-1),
        created=DUMMY_MOCK_TIME,
        is_draft=False,
        name="",
    )


def get_two_round_with_one_tentative_match_each(
    match1: MatchWithDetails, match2: MatchWithDetails
) -> tuple[RoundWithMatches, RoundWithMatches]:
    return (
        RoundWithMatches(
            id=RoundId(-2),
            matches=[match1],
            stage_item_id=StageItemId(-1),
            created=DUMMY_MOCK_TIME,
            is_draft=False,
            name="",
        ),
        RoundWithMatches(
            id=RoundId(-1),
            matches=[match2],
            stage_item_id=StageItemId(-1),
            created=DUMMY_MOCK_TIME,
            is_draft=False,
            name="",
        ),
    )


def get_stage_item_mock(
    stage_item_inputs: list[StageItemInputFinal],
    rounds: list[RoundWithMatches],
) -> StageItemWithRounds:
    return StageItemWithRounds(
        rounds=rounds,
        inputs=[stage_item_inputs[0], stage_item_inputs[1]],
        type_name="Single Elimination",
        team_count=4,
        ranking_id=None,
        id=StageItemId(-1),
        stage_id=StageId(-1),
        name="",
        created=DUMMY_MOCK_TIME,
        type=StageType.SINGLE_ELIMINATION,
    )
