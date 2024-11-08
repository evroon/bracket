from bracket.logic.ranking.elimination import get_inputs_to_update_in_subsequent_elimination_rounds
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
    MatchId,
    RoundId,
    StageId,
    StageItemId,
    StageItemInputId,
    TeamId,
    TournamentId,
)


def test_elimination_input_updates() -> None:
    tournament_id = TournamentId(-1)
    now = DUMMY_MOCK_TIME
    stage_item_input1 = StageItemInputFinal(
        id=StageItemInputId(-1),
        team_id=TeamId(-1),
        slot=1,
        tournament_id=tournament_id,
        team=Team(**DUMMY_TEAM1.model_dump(), id=TeamId(-1)),
    )
    stage_item_input2 = StageItemInputFinal(
        id=StageItemInputId(-2),
        team_id=TeamId(-2),
        slot=2,
        tournament_id=tournament_id,
        team=Team(**DUMMY_TEAM2.model_dump(), id=TeamId(-2)),
    )
    stage_item_input3 = StageItemInputFinal(
        id=StageItemInputId(-1),
        team_id=TeamId(-1),
        slot=3,
        tournament_id=tournament_id,
        team=Team(**DUMMY_TEAM3.model_dump(), id=TeamId(-3)),
    )
    stage_item_input4 = StageItemInputFinal(
        id=StageItemInputId(-4),
        team_id=TeamId(-4),
        slot=4,
        tournament_id=tournament_id,
        team=Team(**DUMMY_TEAM4.model_dump(), id=TeamId(-4)),
    )
    match1 = MatchWithDetailsDefinitive(
        id=MatchId(-1),
        stage_item_input1=stage_item_input1,
        stage_item_input2=stage_item_input2,
        created=now,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-3),
        stage_item_input1_score=2,
        stage_item_input2_score=0,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
    )
    match2 = MatchWithDetailsDefinitive(
        id=MatchId(-2),
        stage_item_input1=stage_item_input3,
        stage_item_input2=stage_item_input4,
        created=now,
        duration_minutes=90,
        margin_minutes=15,
        round_id=RoundId(-3),
        stage_item_input1_score=2,
        stage_item_input2_score=3,
        stage_item_input1_conflict=False,
        stage_item_input2_conflict=False,
    )
    match3 = MatchWithDetails(
        id=MatchId(-3),
        created=now,
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
        created=now,
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

    updates = get_inputs_to_update_in_subsequent_elimination_rounds(
        RoundId(-3),
        StageItemWithRounds(
            rounds=[
                RoundWithMatches(
                    id=RoundId(-3),
                    matches=[match1, match2],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                ),
                RoundWithMatches(
                    id=RoundId(-2),
                    matches=[match3],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                ),
                RoundWithMatches(
                    id=RoundId(-1),
                    matches=[match4],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                ),
            ],
            inputs=[stage_item_input1, stage_item_input2],
            type_name="Single Elimination",
            team_count=4,
            ranking_id=None,
            id=StageItemId(-1),
            stage_id=StageId(-1),
            name="",
            created=now,
            type=StageType.SINGLE_ELIMINATION,
        ),
        {match1.id, match2.id},
    )

    assert updates == {
        match3.id: match3.model_copy(
            update={
                "stage_item_input1_id": stage_item_input1.id,
                "stage_item_input2_id": stage_item_input4.id,
                "stage_item_input1": stage_item_input1,
                "stage_item_input2": stage_item_input4,
            }
        ),
        match4.id: match4.model_copy(
            update={
                "stage_item_input1_id": stage_item_input4.id,
                "stage_item_input2_id": stage_item_input1.id,
                "stage_item_input1": stage_item_input4,
                "stage_item_input2": stage_item_input1,
            }
        ),
    }
