import math
from collections import defaultdict
from decimal import Decimal
from typing import TypeVar

from bracket.logic.ranking.statistics import START_ELO, TeamStatistics
from bracket.models.db.match import MatchWithDetailsDefinitive
from bracket.models.db.ranking import Ranking
from bracket.models.db.stage_item import StageType
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.rankings import get_ranking_for_stage_item
from bracket.sql.teams import update_team_stats
from bracket.utils.id_types import PlayerId, StageItemInputId, TeamId, TournamentId

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


async def recalculate_ranking_for_stage_item(
    tournament_id: TournamentId,
    stage_item: StageItemWithRounds,
) -> None:
    ranking = await get_ranking_for_stage_item(tournament_id, stage_item.id)
    assert stage_item, "Stage item not found"
    assert ranking, "Ranking not found"

    team_x_stage_item_input_lookup = {
        stage_item_input.team_id: stage_item_input.id
        for stage_item_input in stage_item.inputs
        if stage_item_input.team_id is not None
    }

    elo_per_input = determine_ranking_for_stage_item(stage_item, ranking)

    for stage_item_input_id in team_x_stage_item_input_lookup.values():
        await update_team_stats(
            tournament_id, stage_item_input_id, elo_per_input[stage_item_input_id]
        )
