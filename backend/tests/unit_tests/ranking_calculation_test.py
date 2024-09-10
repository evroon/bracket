from decimal import Decimal

from heliclockter import datetime_utc

from bracket.logic.ranking.elo import determine_ranking_for_stage_item
from bracket.logic.ranking.statistics import TeamStatistics
from bracket.models.db.match import MatchWithDetails, MatchWithDetailsDefinitive
from bracket.models.db.ranking import Ranking
from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import StageItemInputFinal
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.utils.dummy_records import DUMMY_TEAM1, DUMMY_TEAM2
from bracket.utils.id_types import (
    MatchId,
    RankingId,
    RoundId,
    StageId,
    StageItemId,
    StageItemInputId,
    TeamId,
    TournamentId,
)


def test_determine_ranking_for_stage_item_elimination() -> None:
    tournament_id = TournamentId(-1)
    now = datetime_utc.now()
    ranking = determine_ranking_for_stage_item(
        StageItemWithRounds(
            rounds=[
                RoundWithMatches(
                    id=RoundId(-1),
                    matches=[
                        MatchWithDetailsDefinitive(
                            id=MatchId(-1),
                            team1=FullTeamWithPlayers(
                                **DUMMY_TEAM1.model_dump(), players=[], id=TeamId(-1)
                            ),
                            team2=FullTeamWithPlayers(
                                **DUMMY_TEAM2.model_dump(), players=[], id=TeamId(-2)
                            ),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=2,
                            team2_score=0,
                        ),
                        MatchWithDetailsDefinitive(
                            id=MatchId(-1),
                            team1=FullTeamWithPlayers(
                                **DUMMY_TEAM1.model_dump(), players=[], id=TeamId(-1)
                            ),
                            team2=FullTeamWithPlayers(
                                **DUMMY_TEAM2.model_dump(), players=[], id=TeamId(-2)
                            ),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=2,
                            team2_score=2,
                        ),
                        MatchWithDetails(  # This gets ignored in ranking calculation
                            id=MatchId(-1),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=3,
                            team2_score=2,
                        ),
                    ],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                )
            ],
            inputs=[
                StageItemInputFinal(
                    id=StageItemInputId(-1), team_id=TeamId(-1), slot=1, tournament_id=tournament_id
                ),
                StageItemInputFinal(
                    id=StageItemInputId(-2), team_id=TeamId(-2), slot=2, tournament_id=tournament_id
                ),
            ],
            type_name="Single Elimination",
            team_count=4,
            ranking_id=None,
            id=StageItemId(-1),
            stage_id=StageId(-1),
            name="",
            created=now,
            type=StageType.SINGLE_ELIMINATION,
        ),
        Ranking(
            id=RankingId(-1),
            tournament_id=tournament_id,
            created=now,
            win_points=Decimal("3.5"),
            draw_points=Decimal("1.25"),
            loss_points=Decimal("0.0"),
            add_score_points=False,
            position=0,
        ),
    )

    assert ranking == {
        -2: TeamStatistics(wins=0, draws=1, losses=1, points=Decimal("1.25")),
        -1: TeamStatistics(wins=1, draws=1, losses=0, points=Decimal("4.75")),
    }


def test_determine_ranking_for_stage_item_swiss() -> None:
    tournament_id = TournamentId(-1)
    now = datetime_utc.now()
    ranking = determine_ranking_for_stage_item(
        StageItemWithRounds(
            rounds=[
                RoundWithMatches(
                    id=RoundId(-1),
                    matches=[
                        MatchWithDetailsDefinitive(
                            id=MatchId(-1),
                            team1=FullTeamWithPlayers(
                                **DUMMY_TEAM1.model_dump(), players=[], id=TeamId(-1)
                            ),
                            team2=FullTeamWithPlayers(
                                **DUMMY_TEAM2.model_dump(), players=[], id=TeamId(-2)
                            ),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=2,
                            team2_score=0,
                        ),
                        MatchWithDetailsDefinitive(
                            id=MatchId(-2),
                            team1=FullTeamWithPlayers(
                                **DUMMY_TEAM1.model_dump(), players=[], id=TeamId(-1)
                            ),
                            team2=FullTeamWithPlayers(
                                **DUMMY_TEAM2.model_dump(), players=[], id=TeamId(-2)
                            ),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=2,
                            team2_score=2,
                        ),
                        MatchWithDetails(  # This gets ignored in ranking calculation
                            id=MatchId(-3),
                            created=now,
                            duration_minutes=90,
                            margin_minutes=15,
                            round_id=RoundId(-1),
                            team1_score=3,
                            team2_score=2,
                        ),
                    ],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                )
            ],
            inputs=[
                StageItemInputFinal(
                    id=StageItemInputId(-1), team_id=TeamId(-1), slot=1, tournament_id=tournament_id
                ),
                StageItemInputFinal(
                    id=StageItemInputId(-2), team_id=TeamId(-2), slot=2, tournament_id=tournament_id
                ),
            ],
            type_name="Swiss",
            team_count=4,
            ranking_id=None,
            id=StageItemId(-1),
            stage_id=StageId(-1),
            name="",
            created=now,
            type=StageType.SWISS,
        ),
        Ranking(
            id=RankingId(-1),
            tournament_id=tournament_id,
            created=now,
            win_points=Decimal("3.5"),
            draw_points=Decimal("1.25"),
            loss_points=Decimal("0.0"),
            add_score_points=False,
            position=0,
        ),
    )

    assert ranking == {
        -2: TeamStatistics(wins=0, draws=1, losses=1, points=Decimal("1208")),
        -1: TeamStatistics(wins=1, draws=1, losses=0, points=Decimal("1320")),
    }


def test_determine_ranking_for_stage_item_swiss_no_matches() -> None:
    tournament_id = TournamentId(-1)
    now = datetime_utc.now()
    ranking = determine_ranking_for_stage_item(
        StageItemWithRounds(
            rounds=[
                RoundWithMatches(
                    id=RoundId(-1),
                    matches=[],
                    stage_item_id=StageItemId(-1),
                    created=now,
                    is_draft=False,
                    name="",
                )
            ],
            inputs=[
                StageItemInputFinal(
                    id=StageItemInputId(-1), team_id=TeamId(-1), slot=1, tournament_id=tournament_id
                ),
                StageItemInputFinal(
                    id=StageItemInputId(-2), team_id=TeamId(-2), slot=2, tournament_id=tournament_id
                ),
            ],
            type_name="Swiss",
            team_count=4,
            ranking_id=None,
            id=StageItemId(-1),
            stage_id=StageId(-1),
            name="",
            created=now,
            type=StageType.SWISS,
        ),
        Ranking(
            id=RankingId(-1),
            tournament_id=tournament_id,
            created=now,
            win_points=Decimal("3.5"),
            draw_points=Decimal("1.25"),
            loss_points=Decimal("0.0"),
            add_score_points=False,
            position=0,
        ),
    )

    assert not ranking
