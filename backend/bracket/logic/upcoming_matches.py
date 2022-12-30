from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.team import TeamWithPlayers
from bracket.utils.sql import get_teams_with_members


def check_team_combination_adheres_to_filter(
    team1: TeamWithPlayers, team2: TeamWithPlayers, filter: MatchFilter
) -> SuggestedMatch | None:
    elo_diff = abs(team1.get_elo() - team2.get_elo())
    if elo_diff < filter.elo_diff:
        return SuggestedMatch(team1=team1, team2=team2, elo_diff=elo_diff)

    return None


async def get_possible_upcoming_matches(
    tournament_id: int, filter: MatchFilter
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    teams = await get_teams_with_members(tournament_id)
    for i, team1 in enumerate(teams.data):
        for j, team2 in enumerate(teams.data[i + 1 :]):
            suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter)
            if suggested_match:
                suggestions.append(suggested_match)

    return suggestions
