import math
from collections import defaultdict
from decimal import Decimal
from typing import TypeVar

from bracket.logic.ranking.statistics import START_ELO, TeamStatistics
from bracket.models.db.match import Match, MatchWithDetailsDefinitive
from bracket.models.db.ranking import Ranking
from bracket.models.db.stage_item import StageType
from bracket.models.db.stage_item_inputs import StageItemInput
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.matches import (
    sql_set_input_ids_for_match,
)
from bracket.utils.id_types import (
    MatchId,
    PlayerId,
    RoundId,
    StageItemInputId,
    TeamId,
)

K = 32
D = 400


TeamIdOrPlayerId = TypeVar("TeamIdOrPlayerId", bound=PlayerId | TeamId)


def set_statistics_for_stage_item_input(
    team_index: int,
    stats: defaultdict[StageItemInputId, TeamStatistics],
    match: MatchWithDetailsDefinitive,
    stage_item_input_id: StageItemInputId,
    ranking: Ranking,
    stage_item: StageItemWithRounds,
) -> None:
    is_team1 = team_index == 0
    team_score = match.stage_item_input1_score if is_team1 else match.stage_item_input2_score
    was_draw = match.stage_item_input1_score == match.stage_item_input2_score
    has_won = not was_draw and team_score == max(
        match.stage_item_input1_score, match.stage_item_input2_score
    )

    if has_won:
        stats[stage_item_input_id].wins += 1
        swiss_score_diff = ranking.win_points
    elif was_draw:
        stats[stage_item_input_id].draws += 1
        swiss_score_diff = ranking.draw_points
    else:
        stats[stage_item_input_id].losses += 1
        swiss_score_diff = ranking.loss_points

    if ranking.add_score_points:
        swiss_score_diff += (
            match.stage_item_input1_score if is_team1 else match.stage_item_input2_score
        )

    match stage_item.type:
        case StageType.ROUND_ROBIN | StageType.SINGLE_ELIMINATION:
            stats[stage_item_input_id].points += swiss_score_diff

        case StageType.SWISS:
            rating_diff = (match.stage_item_input2.elo - match.stage_item_input1.elo) * (
                1 if is_team1 else -1
            )
            expected_score = Decimal(1.0 / (1.0 + math.pow(10.0, rating_diff / D)))
            stats[stage_item_input_id].points += int(K * (swiss_score_diff - expected_score))

        case _:
            raise ValueError(f"Unsupported stage type: {stage_item.type}")


def determine_ranking_for_stage_item(
    stage_item: StageItemWithRounds,
    ranking: Ranking,
) -> defaultdict[StageItemInputId, TeamStatistics]:
    input_x_stats: defaultdict[StageItemInputId, TeamStatistics] = defaultdict(TeamStatistics)

    if stage_item.type is StageType.SWISS:
        for input_ in stage_item.inputs:
            input_x_stats[input_.id].points = START_ELO

    matches = [
        match
        for round_ in stage_item.rounds
        if not round_.is_draft
        for match in round_.matches
        if isinstance(match, MatchWithDetailsDefinitive)
    ]
    for match in matches:
        for team_index, stage_item_input in enumerate(match.stage_item_inputs):
            set_statistics_for_stage_item_input(
                team_index,
                input_x_stats,
                match,
                stage_item_input.id,
                ranking,
                stage_item,
            )

    return input_x_stats


def determine_team_ranking_for_stage_item(
    stage_item: StageItemWithRounds,
    ranking: Ranking,
) -> list[tuple[StageItemInputId, TeamStatistics]]:
    team_ranking = determine_ranking_for_stage_item(stage_item, ranking)
    return sorted(team_ranking.items(), key=lambda x: x[1].points, reverse=True)


def get_inputs_to_update_in_subsequent_elimination_rounds(
    current_round_id: RoundId,
    stage_item: StageItemWithRounds,
    match_ids: set[MatchId],
) -> dict[MatchId, Match]:
    """
    Determine the updates of stage item input IDs in the elimination tree.

    Crucial aspect is that entering a winner for a match will influence matches of subsequent
    rounds, because of the tree-like structure of elimination stage items.
    """
    current_round = next(round_ for round_ in stage_item.rounds if round_.id == current_round_id)
    affected_matches: dict[MatchId, Match] = {
        match.id: match for match in current_round.matches if match.id in match_ids
    }
    subsequent_rounds = [round_ for round_ in stage_item.rounds if round_.id > current_round.id]
    subsequent_rounds.sort(key=lambda round_: round_.id)
    subsequent_matches = [match for round_ in subsequent_rounds for match in round_.matches]

    for subsequent_match in subsequent_matches:
        updated_inputs: list[StageItemInput | None] = [
            subsequent_match.stage_item_input1,
            subsequent_match.stage_item_input2,
        ]
        original_inputs = updated_inputs.copy()

        if subsequent_match.stage_item_input1_winner_from_match_id in affected_matches:
            updated_inputs[0] = affected_matches[
                subsequent_match.stage_item_input1_winner_from_match_id
            ].get_winner()

        if subsequent_match.stage_item_input2_winner_from_match_id in affected_matches:
            updated_inputs[1] = affected_matches[
                subsequent_match.stage_item_input2_winner_from_match_id
            ].get_winner()

        if original_inputs != updated_inputs:
            input_ids = [input_.id if input_ else None for input_ in updated_inputs]

            affected_matches[subsequent_match.id] = subsequent_match.model_copy(
                update={
                    "stage_item_input1_id": input_ids[0],
                    "stage_item_input2_id": input_ids[1],
                    "stage_item_input1": updated_inputs[0],
                    "stage_item_input2": updated_inputs[1],
                }
            )

    # All affected matches need to be updated except for the inputs.
    return {
        match_id: match for match_id, match in affected_matches.items() if match_id not in match_ids
    }


async def update_inputs_in_subsequent_elimination_rounds(
    current_round_id: RoundId,
    stage_item: StageItemWithRounds,
    match_ids: set[MatchId],
) -> None:
    updates = get_inputs_to_update_in_subsequent_elimination_rounds(
        current_round_id, stage_item, match_ids
    )
    for _, match in updates.items():
        await sql_set_input_ids_for_match(
            match.round_id, match.id, [match.stage_item_input1_id, match.stage_item_input2_id]
        )
