from fastapi import HTTPException

from bracket.logic.scheduling.shared import check_team_combination_adheres_to_filter
from bracket.models.db.match import (
    MatchFilter,
    MatchWithDetailsDefinitive,
    SuggestedMatch,
    SuggestedVirtualMatch,
)
from bracket.sql.rounds import get_rounds_for_stage_item
from bracket.sql.teams import get_teams_with_members


async def todo_get_possible_upcoming_matches_for_teams(
    tournament_id: int, filter_: MatchFilter, stage_id: int
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    suggestions: list[SuggestedMatch | SuggestedVirtualMatch] = []
    rounds = await get_rounds_for_stage_item(tournament_id, stage_id)  # TODO: fix stage item id
    draft_round = next((round_ for round_ in rounds if round_.is_draft), None)
    if draft_round is None:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    teams = await get_teams_with_members(tournament_id, only_active_teams=True)

    for i, team1 in enumerate(teams):
        for _, team2 in enumerate(teams[i + 1 :]):
            team_already_scheduled = any(
                team1.id in match.team_ids or team2.id in match.team_ids
                for match in draft_round.matches
                if isinstance(match, MatchWithDetailsDefinitive)
            )
            if team_already_scheduled:
                continue

            suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter_)
            if suggested_match:
                suggestions.append(suggested_match)

    return suggestions
