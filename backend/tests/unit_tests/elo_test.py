from decimal import Decimal

from bracket.logic.elo import PlayerStatistics, calculate_elo_per_player
from bracket.models.db.match import MatchWithTeamDetails
from bracket.models.db.round import RoundWithMatches
from bracket.models.db.team import TeamWithPlayers
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_PLAYER1, DUMMY_PLAYER2


def test_elo_calculation() -> None:
    round_ = RoundWithMatches(
        tournament_id=1,
        created=DUMMY_MOCK_TIME,
        is_draft=True,
        is_active=False,
        name='Some round',
        matches=[
            MatchWithTeamDetails(
                created=DUMMY_MOCK_TIME,
                team1_id=1,
                team2_id=1,
                team1_score=3,
                team2_score=4,
                round_id=1,
                team1=TeamWithPlayers(
                    name='Dummy team 1',
                    tournament_id=1,
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER1.copy(update={'id': 1})],
                ),
                team2=TeamWithPlayers(
                    name='Dummy team 2',
                    tournament_id=1,
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER2.copy(update={'id': 2})],
                ),
            )
        ],
    )
    calculation = calculate_elo_per_player([round_])
    assert calculation == {
        1: PlayerStatistics(losses=1, elo_score=3, swiss_score=Decimal('0.00')),
        2: PlayerStatistics(wins=1, elo_score=4, swiss_score=Decimal('1.00')),
    }
