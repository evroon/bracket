from fastapi import HTTPException

from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.team import TeamWithPlayers
from bracket.utils.sql import get_rounds_with_matches, get_teams_with_members


def check_team_combination_adheres_to_filter(
    team1: TeamWithPlayers, team2: TeamWithPlayers, filter: MatchFilter
) -> SuggestedMatch | None:
    elo_diff = abs(team1.get_elo() - team2.get_elo())
    swiss_diff = abs(team1.get_swiss_score() - team2.get_swiss_score())

    if elo_diff < filter.elo_diff:
        return SuggestedMatch(team1=team1, team2=team2, elo_diff=elo_diff, swiss_diff=swiss_diff)

    return None


async def get_possible_upcoming_matches(
    tournament_id: int, filter: MatchFilter
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    rounds_response = await get_rounds_with_matches(tournament_id)
    draft_round = next((round for round in rounds_response.data if round.is_draft), None)
    if draft_round is None:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    teams = await get_teams_with_members(tournament_id, only_active_teams=True)

    for i, team1 in enumerate(teams.data):
        for j, team2 in enumerate(teams.data[i + 1 :]):
            team_already_scheduled = any(
                (
                    True
                    for match in draft_round.matches
                    if team1.id in match.team_ids or team2.id in match.team_ids
                )
            )
            if team_already_scheduled:
                continue

            suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter)
            if suggested_match:
                suggestions.append(suggested_match)

    return suggestions
