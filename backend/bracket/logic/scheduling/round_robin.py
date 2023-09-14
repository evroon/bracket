import math
from typing import cast

from bracket.logic.matches import create_match_and_assign_free_court
from bracket.logic.scheduling.shared import get_suggested_match
from bracket.models.db.match import (
    MatchCreateBody,
    SuggestedMatch,
    SuggestedVirtualMatch,
)
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.teams import get_teams_with_members
from bracket.utils.types import assert_some


async def build_round_robin_stage_item(
    tournament_id: int, stage_item: StageItemWithRounds
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    suggestions: list[SuggestedMatch] = []
    teams = await get_teams_with_members(tournament_id, only_active_teams=True)

    for round_ in stage_item.rounds:
        round_suggestions: list[SuggestedMatch] = []

        for i, team1 in enumerate(teams):
            for _, team2 in enumerate(teams[i + 1 :]):
                match_already_scheduled = any(
                    team1.id in match.team_ids and team2.id in match.team_ids
                    for match in suggestions
                ) or any(
                    team1.id in match.team_ids or team2.id in match.team_ids
                    for match in round_suggestions
                )
                if match_already_scheduled:
                    continue

                suggestions.append(get_suggested_match(team1, team2))
                round_suggestions.append(get_suggested_match(team1, team2))

                match = MatchCreateBody(
                    round_id=assert_some(round_.id),
                    team1_id=assert_some(team1.id),
                    team2_id=assert_some(team2.id),
                    court_id=None,
                )
                await create_match_and_assign_free_court(tournament_id, match)

    return cast(list[SuggestedMatch | SuggestedVirtualMatch], suggestions)


def get_number_of_rounds_to_create_round_robin(team_count: int) -> int:
    if team_count < 1:
        return 0

    concurrency = team_count // 2
    number_of_games = (team_count - 1) * team_count / 2
    return math.ceil(number_of_games / concurrency)
