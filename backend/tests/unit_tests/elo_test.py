from decimal import Decimal

from bracket.logic.ranking.elo import determine_ranking_for_stage_item
from bracket.models.db.match import MatchWithDetailsDefinitive
from bracket.models.db.players import TeamStatistics
from bracket.models.db.ranking import Ranking
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.utils.dummy_records import (
    DUMMY_MOCK_TIME,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_STAGE_ITEM1,
)
from bracket.utils.id_types import RankingId, RoundId, StageItemId, TeamId, TournamentId


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
    ranking = Ranking(
        id=RankingId(-1),
        tournament_id=TournamentId(1),
        created=DUMMY_MOCK_TIME,
        win_points=Decimal("1.0"),
        draw_points=Decimal("0.5"),
        loss_points=Decimal("0.0"),
        add_score_points=False,
        position=1,
    )
    stage_item = StageItemWithRounds(
        **DUMMY_STAGE_ITEM1.model_dump(exclude={"id"}),
        id=StageItemId(-1),
        inputs=[],
        rounds=[round_],
    )
    assert determine_ranking_for_stage_item(stage_item, ranking) == {
        3: TeamStatistics(losses=1, points=Decimal("0.0")),
        4: TeamStatistics(wins=1, points=Decimal("1.0")),
    }
