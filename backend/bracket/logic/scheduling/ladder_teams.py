from fastapi import HTTPException

from bracket.logic.scheduling.shared import check_team_combination_adheres_to_filter
from bracket.models.db.match import (
    MatchFilter,
    SuggestedMatch,
)
from bracket.utils.sql import (
    get_rounds_with_matches,
    get_teams_with_members,
)


async def get_possible_upcoming_matches_for_teams(
    tournament_id: int, filter: MatchFilter
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    rounds_response = await get_rounds_with_matches(tournament_id)
    draft_round = next((round for round in rounds_response if round.is_draft), None)
    if draft_round is None:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    teams = await get_teams_with_members(tournament_id, only_active_teams=True)

    for i, team1 in enumerate(teams):
        for j, team2 in enumerate(teams[i + 1 :]):
            team_already_scheduled = any(
                (
                    team1.id in match.team_ids or team2.id in match.team_ids
                    for match in draft_round.matches
                )
            )
            if team_already_scheduled:
                continue

            suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter)
            if suggested_match:
                suggestions.append(suggested_match)

    return suggestions
