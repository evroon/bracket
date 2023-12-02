from decimal import Decimal

import pytest
from fastapi import HTTPException

from bracket.logic.scheduling.ladder_teams import get_possible_upcoming_matches_for_swiss
from bracket.models.db.match import Match, MatchFilter, MatchWithDetailsDefinitive, SuggestedMatch
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.models.db.util import RoundWithMatches
from bracket.utils.dummy_records import (
    DUMMY_MATCH1,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
    DUMMY_TEAM3,
    DUMMY_TEAM4,
)
from tests.integration_tests.mocks import MOCK_NOW

MATCH_FILTER = MatchFilter(elo_diff_threshold=50, iterations=100, limit=20, only_recommended=False)


def test_no_draft_round() -> None:
    with pytest.raises(HTTPException, match='There is no draft round, so no matches can be'):
        get_possible_upcoming_matches_for_swiss(MATCH_FILTER, [], [])


def get_team(team: Team, team_id: int) -> FullTeamWithPlayers:
    return FullTeamWithPlayers(
        id=team_id,
        **team.dict(),
        players=[],
    )


def get_match(
    match: Match, team1: FullTeamWithPlayers, team2: FullTeamWithPlayers
) -> MatchWithDetailsDefinitive:
    return MatchWithDetailsDefinitive(
        **match.copy(update={'team1_id': team1.id, 'team2_id': team2.id}).dict(),
        team1=team1,
        team2=team2,
        court=None,
    )


def test_constraints() -> None:
    team1 = get_team(DUMMY_TEAM1.copy(update={'elo_score': 1125}), team_id=-1)
    team2 = get_team(DUMMY_TEAM2.copy(update={'elo_score': 1175}), team_id=-2)
    team3 = get_team(DUMMY_TEAM3.copy(update={'elo_score': 1200}), team_id=-3)
    team4 = get_team(DUMMY_TEAM4.copy(update={'elo_score': 1250}), team_id=-4)

    rounds = [
        RoundWithMatches(
            matches=[get_match(DUMMY_MATCH1, team1, team2)],
            is_draft=False,
            stage_item_id=-1,
            name='R1',
            created=MOCK_NOW,
        ),
        RoundWithMatches(matches=[], is_draft=True, stage_item_id=-1, name='R2', created=MOCK_NOW),
    ]
    teams = [team1, team2, team3, team4]
    result = get_possible_upcoming_matches_for_swiss(MATCH_FILTER, rounds, teams)

    # Team 3 and 4 haven't played yet, so any suggested match with one or more of those teams
    # is recommended.
    assert result == [
        SuggestedMatch(
            team1=team3,
            team2=team2,
            elo_diff=Decimal('25'),
            swiss_diff=Decimal('0.0'),
            is_recommended=True,
            player_behind_schedule_count=0,
        ),
        SuggestedMatch(
            team1=team4,
            team2=team3,
            elo_diff=Decimal('50'),
            swiss_diff=Decimal('0.0'),
            is_recommended=True,
            player_behind_schedule_count=0,
        ),
    ]
