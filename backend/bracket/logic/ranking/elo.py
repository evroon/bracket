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
from bracket.sql.stage_items import get_stage_item
from bracket.sql.teams import update_team_stats
from bracket.utils.id_types import PlayerId, StageItemId, TeamId, TournamentId
from bracket.utils.types import assert_some

K = 32
D = 400


TeamIdOrPlayerId = TypeVar("TeamIdOrPlayerId", bound=PlayerId | TeamId)


def set_statistics_for_team(
    team_index: int,
    stats: defaultdict[TeamId, TeamStatistics],
    match: MatchWithDetailsDefinitive,
    team_id: TeamId,
    rating_team1_before: Decimal,
    rating_team2_before: Decimal,
    ranking: Ranking,
    stage_item: StageItemWithRounds,
) -> None:
    is_team1 = team_index == 0
    team_score = match.team1_score if is_team1 else match.team2_score
    was_draw = match.team1_score == match.team2_score
    has_won = not was_draw and team_score == max(match.team1_score, match.team2_score)

    # Set default for SWISS teams
    if stage_item.type is StageType.SWISS and team_id not in stats:
        stats[team_id].points = START_ELO

    if has_won:
        stats[team_id].wins += 1
        swiss_score_diff = ranking.win_points
    elif was_draw:
        stats[team_id].draws += 1
        swiss_score_diff = ranking.draw_points
    else:
        stats[team_id].losses += 1
        swiss_score_diff = ranking.loss_points

    if ranking.add_score_points:
        swiss_score_diff += match.team1_score if is_team1 else match.team2_score

    match stage_item.type:
        case StageType.ROUND_ROBIN | StageType.SINGLE_ELIMINATION:
            stats[team_id].points += swiss_score_diff

        case StageType.SWISS:
            rating_diff = (rating_team2_before - rating_team1_before) * (1 if is_team1 else -1)
            expected_score = Decimal(1.0 / (1.0 + math.pow(10.0, rating_diff / D)))
            stats[team_id].points += int(K * (swiss_score_diff - expected_score))

        case _:
            raise ValueError(f"Unsupported stage type: {stage_item.type}")


def determine_ranking_for_stage_item(
    stage_item: StageItemWithRounds,
    ranking: Ranking,
) -> defaultdict[TeamId, TeamStatistics]:
    team_x_stats: defaultdict[TeamId, TeamStatistics] = defaultdict(TeamStatistics)
    matches = [
        match
        for round_ in stage_item.rounds
        if not round_.is_draft
        for match in round_.matches
        if isinstance(match, MatchWithDetailsDefinitive)
        if match.team1_score != 0 or match.team2_score != 0
    ]
    for match in matches:
        for team_index, team in enumerate(match.teams):
            if team.id is not None:
                set_statistics_for_team(
                    team_index,
                    team_x_stats,
                    match,
                    team.id,
                    match.team1.elo_score,
                    match.team2.elo_score,
                    ranking,
                    stage_item,
                )

    return team_x_stats


def determine_team_ranking_for_stage_item(
    stage_item: StageItemWithRounds,
    ranking: Ranking,
) -> list[tuple[TeamId, TeamStatistics]]:
    team_ranking = determine_ranking_for_stage_item(stage_item, ranking)
    return sorted(team_ranking.items(), key=lambda x: x[1].points, reverse=True)


async def recalculate_ranking_for_stage_item_id(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
) -> None:
    stage_item = await get_stage_item(tournament_id, stage_item_id)
    ranking = await get_ranking_for_stage_item(tournament_id, stage_item_id)
    assert stage_item, "Stage item not found"
    assert ranking, "Ranking not found"

    team_x_stage_item_input_lookup = {
        stage_item_input.team_id: assert_some(stage_item_input.id)
        for stage_item_input in stage_item.inputs
        if stage_item_input.team_id is not None
    }

    elo_per_team = determine_ranking_for_stage_item(stage_item, ranking)

    for team_id, stage_item_input_id in team_x_stage_item_input_lookup.items():
        await update_team_stats(tournament_id, stage_item_input_id, elo_per_team[team_id])
