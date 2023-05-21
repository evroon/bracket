from bracket.logic.scheduling.shared import get_suggested_match
from bracket.models.db.match import SuggestedMatch
from bracket.sql.rounds import get_rounds_for_stage
from bracket.sql.teams import get_teams_with_members


async def get_possible_upcoming_matches_round_robin(
    tournament_id: int, stage_id: int, round_id: int
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    rounds = await get_rounds_for_stage(tournament_id, stage_id)
    draft_round = next((round_ for round_ in rounds if round_.id == round_id))

    teams = await get_teams_with_members(tournament_id, only_active_teams=True)

    for i, team1 in enumerate(teams):
        for _, team2 in enumerate(teams[i + 1 :]):
            team_already_scheduled = any(
                (
                    team1.id in match.team_ids or team2.id in match.team_ids
                    for match in draft_round.matches
                )
            )
            if team_already_scheduled:
                continue

            suggestions.append(get_suggested_match(team1, team2))

    return suggestions
