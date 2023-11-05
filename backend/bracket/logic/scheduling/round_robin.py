import math

from bracket.logic.matches import create_match_and_assign_free_court
from bracket.models.db.match import (
    MatchCreateBody,
)
from bracket.models.db.stage_item_inputs import StageItemInputGeneric
from bracket.models.db.util import StageItemWithRounds
from bracket.utils.types import assert_some


async def build_round_robin_stage_item(tournament_id: int, stage_item: StageItemWithRounds) -> None:
    suggestions: list[set[StageItemInputGeneric]] = []

    for round_ in stage_item.rounds:
        round_suggestions: list[set[StageItemInputGeneric]] = []

        for i, team1 in enumerate(stage_item.inputs):
            for _, team2 in enumerate(stage_item.inputs[i + 1 :]):
                team1_def = StageItemInputGeneric(
                    team_id=team1.id,
                    winner_from_stage_item_id=team1.winner_from_stage_item_id,
                    winner_position=team1.winner_position,
                    winner_from_match_id=team1.winner_from_match_id,
                )
                team2_def = StageItemInputGeneric(
                    team_id=team2.id,
                    winner_from_stage_item_id=team2.winner_from_stage_item_id,
                    winner_position=team2.winner_position,
                    winner_from_match_id=team2.winner_from_match_id,
                )
                team_defs = {team1_def, team2_def}

                match_already_scheduled = any(
                    team1_def in match and team2_def in match for match in suggestions
                ) or any(team1_def in match or team2_def in match for match in round_suggestions)
                if match_already_scheduled:
                    continue

                match = MatchCreateBody(
                    round_id=assert_some(round_.id),
                    team1_id=assert_some(team1.id),
                    team2_id=assert_some(team2.id),
                    team1_winner_from_stage_item_id=team1.winner_from_stage_item_id,
                    team1_winner_position=team1.winner_position,
                    team1_winner_from_match_id=team1.winner_from_match_id,
                    team2_winner_from_stage_item_id=team2.winner_from_stage_item_id,
                    team2_winner_position=team2.winner_position,
                    team2_winner_from_match_id=team2.winner_from_match_id,
                    court_id=None,
                )

                suggestions.append(team_defs)
                round_suggestions.append(team_defs)
                await create_match_and_assign_free_court(tournament_id, match)


def get_number_of_rounds_to_create_round_robin(team_count: int) -> int:
    if team_count < 1:
        return 0

    concurrency = team_count // 2
    number_of_games = (team_count - 1) * team_count / 2
    return math.ceil(number_of_games / concurrency)
