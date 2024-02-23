import math
from collections import defaultdict
from decimal import Decimal
from typing import TypeVar

from bracket.database import database
from bracket.models.db.match import MatchWithDetailsDefinitive
from bracket.models.db.players import START_ELO, PlayerStatistics
from bracket.models.db.util import StageItemWithRounds
from bracket.schema import players
from bracket.sql.players import get_all_players_in_tournament, update_player_stats
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.teams import update_team_stats
from bracket.utils.id_types import PlayerId, TeamId, TournamentId
from bracket.utils.types import assert_some

K = 32
D = 400


TeamIdOrPlayerId = TypeVar("TeamIdOrPlayerId", bound=PlayerId | TeamId)


def set_statistics_for_player_or_team(
    team_index: int,
    stats: defaultdict[TeamIdOrPlayerId, PlayerStatistics],
    match: MatchWithDetailsDefinitive,
    team_or_player_id: TeamIdOrPlayerId,
    rating_team1_before: float,
    rating_team2_before: float,
) -> None:
    is_team1 = team_index == 0
    team_score = match.team1_score if is_team1 else match.team2_score
    was_draw = match.team1_score == match.team2_score
    has_won = not was_draw and team_score == max(match.team1_score, match.team2_score)

    if has_won:
        stats[team_or_player_id].wins += 1
        swiss_score_diff = Decimal("1.00")
    elif was_draw:
        stats[team_or_player_id].draws += 1
        swiss_score_diff = Decimal("0.50")
    else:
        stats[team_or_player_id].losses += 1
        swiss_score_diff = Decimal("0.00")

    stats[team_or_player_id].swiss_score += swiss_score_diff

    rating_diff = (rating_team2_before - rating_team1_before) * (1 if is_team1 else -1)
    expected_score = Decimal(1.0 / (1.0 + math.pow(10.0, rating_diff / D)))
    stats[team_or_player_id].elo_score += int(K * (swiss_score_diff - expected_score))


def determine_ranking_for_stage_items(
    stage_items: list[StageItemWithRounds],
) -> tuple[defaultdict[PlayerId, PlayerStatistics], defaultdict[TeamId, PlayerStatistics]]:
    player_x_stats: defaultdict[PlayerId, PlayerStatistics] = defaultdict(PlayerStatistics)
    team_x_stats: defaultdict[TeamId, PlayerStatistics] = defaultdict(PlayerStatistics)
    matches = [
        match
        for stage_item in stage_items
        for round_ in stage_item.rounds
        if not round_.is_draft
        for match in round_.matches
        if isinstance(match, MatchWithDetailsDefinitive)
        if match.team1_score != 0 or match.team2_score != 0
    ]
    for match in matches:
        rating_team1_before = (
            sum(player_x_stats[player_id].elo_score for player_id in match.team1.player_ids)
            / len(match.team1.player_ids)
            if len(match.team1.player_ids) > 0
            else START_ELO
        )
        rating_team2_before = (
            sum(player_x_stats[player_id].elo_score for player_id in match.team2.player_ids)
            / len(match.team2.player_ids)
            if len(match.team2.player_ids) > 0
            else START_ELO
        )

        for team_index, team in enumerate(match.teams):
            if team.id is not None:
                set_statistics_for_player_or_team(
                    team_index,
                    team_x_stats,
                    match,
                    team.id,
                    rating_team1_before,
                    rating_team2_before,
                )

            for player in team.players:
                set_statistics_for_player_or_team(
                    team_index,
                    player_x_stats,
                    match,
                    assert_some(player.id),
                    rating_team1_before,
                    rating_team2_before,
                )

    return player_x_stats, team_x_stats


def determine_team_ranking_for_stage_item(
    stage_item: StageItemWithRounds,
) -> list[tuple[TeamId, PlayerStatistics]]:
    _, team_ranking = determine_ranking_for_stage_items([stage_item])
    return sorted(team_ranking.items(), key=lambda x: x[1].elo_score, reverse=True)


async def recalculate_ranking_for_tournament_id(tournament_id: TournamentId) -> None:
    stages = await get_full_tournament_details(tournament_id)
    stage_items = [stage_item for stage in stages for stage_item in stage.stage_items]
    await recalculate_ranking_for_stage_items(tournament_id, stage_items)


async def recalculate_ranking_for_stage_items(
    tournament_id: TournamentId, stage_items: list[StageItemWithRounds]
) -> None:
    elo_per_player, elo_per_team = determine_ranking_for_stage_items(stage_items)

    for player_id, statistics in elo_per_player.items():
        await update_player_stats(tournament_id, player_id, statistics)

    for team_id, statistics in elo_per_team.items():
        await update_team_stats(tournament_id, team_id, statistics)

    all_players = await get_all_players_in_tournament(tournament_id)
    for player in all_players:
        if player.id not in elo_per_player:
            await database.execute(
                query=players.update().where(
                    (players.c.id == player.id) & (players.c.tournament_id == tournament_id)
                ),
                values=PlayerStatistics().model_dump(),
            )
