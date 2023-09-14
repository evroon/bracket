from decimal import Decimal

from bracket.logic.elo import calculate_elo_per_player
from bracket.models.db.match import MatchWithDetails
from bracket.models.db.players import PlayerStatistics
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import RoundWithMatches
from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_PLAYER1, DUMMY_PLAYER2


def test_elo_calculation() -> None:
    round_ = RoundWithMatches(
        stage_item_id=1,
        created=DUMMY_MOCK_TIME,
        is_draft=False,
        is_active=False,
        name='Some round',
        matches=[
            MatchWithDetails(
                created=DUMMY_MOCK_TIME,
                team1_id=1,
                team2_id=1,
                team1_score=3,
                team2_score=4,
                round_id=1,
                court_id=None,
                court=None,
                team1=FullTeamWithPlayers(
                    name='Dummy team 1',
                    tournament_id=1,
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER1.copy(update={'id': 1})],
                    elo_score=DUMMY_PLAYER1.elo_score,
                    swiss_score=DUMMY_PLAYER1.swiss_score,
                    wins=DUMMY_PLAYER1.wins,
                    draws=DUMMY_PLAYER1.draws,
                    losses=DUMMY_PLAYER1.losses,
                ),
                team2=FullTeamWithPlayers(
                    name='Dummy team 2',
                    tournament_id=1,
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER2.copy(update={'id': 2})],
                    elo_score=DUMMY_PLAYER2.elo_score,
                    swiss_score=DUMMY_PLAYER2.swiss_score,
                    wins=DUMMY_PLAYER2.wins,
                    draws=DUMMY_PLAYER2.draws,
                    losses=DUMMY_PLAYER2.losses,
                ),
            )
        ],
    )
    calculation = calculate_elo_per_player([round_])
    assert calculation == {
        1: PlayerStatistics(losses=1, elo_score=1184, swiss_score=Decimal('0.00')),
        2: PlayerStatistics(wins=1, elo_score=1216, swiss_score=Decimal('1.00')),
    }
