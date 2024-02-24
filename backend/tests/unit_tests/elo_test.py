from decimal import Decimal

from bracket.logic.ranking.elo import (
    determine_ranking_for_stage_items,
)
from bracket.models.db.match import MatchWithDetailsDefinitive
from bracket.models.db.players import PlayerStatistics
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.utils.dummy_records import (
    DUMMY_MOCK_TIME,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_STAGE_ITEM1,
)
from bracket.utils.id_types import RoundId, StageItemId, TeamId, TournamentId


def test_elo_calculation() -> None:
    round_ = RoundWithMatches(
        stage_item_id=StageItemId(1),
        created=DUMMY_MOCK_TIME,
        is_draft=False,
        is_active=False,
        name="Some round",
        matches=[
            MatchWithDetailsDefinitive(
                created=DUMMY_MOCK_TIME,
                start_time=DUMMY_MOCK_TIME,
                team1_id=TeamId(1),
                team2_id=TeamId(1),
                team1_winner_from_stage_item_id=None,
                team1_winner_position=None,
                team1_winner_from_match_id=None,
                team2_winner_from_stage_item_id=None,
                team2_winner_position=None,
                team2_winner_from_match_id=None,
                team1_score=3,
                team2_score=4,
                round_id=RoundId(1),
                court_id=None,
                court=None,
                duration_minutes=10,
                margin_minutes=5,
                custom_duration_minutes=None,
                custom_margin_minutes=None,
                position_in_schedule=0,
                team1=FullTeamWithPlayers(
                    id=TeamId(3),
                    name="Dummy team 1",
                    tournament_id=TournamentId(1),
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER1.model_copy(update={"id": 1})],
                    elo_score=DUMMY_PLAYER1.elo_score,
                    swiss_score=DUMMY_PLAYER1.swiss_score,
                    wins=DUMMY_PLAYER1.wins,
                    draws=DUMMY_PLAYER1.draws,
                    losses=DUMMY_PLAYER1.losses,
                ),
                team2=FullTeamWithPlayers(
                    id=TeamId(4),
                    name="Dummy team 2",
                    tournament_id=TournamentId(1),
                    active=True,
                    created=DUMMY_MOCK_TIME,
                    players=[DUMMY_PLAYER2.model_copy(update={"id": 2})],
                    elo_score=DUMMY_PLAYER2.elo_score,
                    swiss_score=DUMMY_PLAYER2.swiss_score,
                    wins=DUMMY_PLAYER2.wins,
                    draws=DUMMY_PLAYER2.draws,
                    losses=DUMMY_PLAYER2.losses,
                ),
            )
        ],
    )
    stage_item = StageItemWithRounds(
        **DUMMY_STAGE_ITEM1.model_dump(exclude={"id"}),
        id=StageItemId(-1),
        inputs=[],
        rounds=[round_],
    )
    player_stats, team_stats = determine_ranking_for_stage_items([stage_item])
    assert player_stats == {
        1: PlayerStatistics(losses=1, elo_score=1184, swiss_score=Decimal("0.00")),
        2: PlayerStatistics(wins=1, elo_score=1216, swiss_score=Decimal("1.00")),
    }
    assert team_stats == {
        3: PlayerStatistics(losses=1, elo_score=1184, swiss_score=Decimal("0.00")),
        4: PlayerStatistics(wins=1, elo_score=1216, swiss_score=Decimal("1.00")),
    }
