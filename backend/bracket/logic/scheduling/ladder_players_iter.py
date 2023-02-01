import random
from collections import defaultdict
from functools import lru_cache

from fastapi import HTTPException

from bracket.logic.scheduling.shared import check_team_combination_adheres_to_filter
from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.player import Player
from bracket.models.db.round import RoundWithMatches
from bracket.models.db.team import TeamWithPlayers
from bracket.utils.sql import get_active_players_in_tournament, get_rounds_with_matches
from bracket.utils.types import assert_some


def player_already_scheduled(player: Player, draft_round: RoundWithMatches) -> bool:
    return any((player.id in match.player_ids for match in draft_round.matches))


async def get_possible_upcoming_matches_for_players(
    tournament_id: int, filter_: MatchFilter
) -> list[SuggestedMatch]:
    random.seed(10)
    suggestions: set[SuggestedMatch] = set()
    all_rounds = await get_rounds_with_matches(tournament_id)
    draft_round = next((round_ for round_ in all_rounds if round_.is_draft), None)
    other_rounds = [round_ for round_ in all_rounds if not round_.is_draft]
    max_matches_per_round = (
        max(len(other_round.matches) for other_round in other_rounds)
        if len(other_rounds) > 0
        else 10
    )

    @lru_cache
    def team_already_scheduled_before(player1: Player, player2: Player) -> bool:
        return any(
            (
                player1 in match.team1.players and player2 in match.team2.players
                for round_ in other_rounds
                for match in round_.matches
            )
        )

    team_already_scheduled_before.cache_clear()
    if draft_round is None:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    players = await get_active_players_in_tournament(tournament_id)

    players_match_count: dict[int, int] = defaultdict(int)
    for round_ in other_rounds:
        for match_ in round_.matches:
            for player_id in match_.player_ids:
                players_match_count[player_id] += 1

    for player in players:
        if player.id not in players_match_count:
            players_match_count[assert_some(player.id)] = 0

    max_played_matches = max(players_match_count.values())
    player_ids_behind_schedule = [
        player_id
        for player_id, played in players_match_count.items()
        if played != max_played_matches
    ]
    players_behind_schedule = [
        player for player in players if player.id in player_ids_behind_schedule
    ]
    players_to_consider = players_behind_schedule if filter_.only_behind_schedule else players
    players_to_schedule = [
        player
        for player in players_to_consider
        if not player_already_scheduled(player, draft_round)
    ]

    if len(players_to_schedule) < 4:
        return []

    for i in range(filter_.iterations):
        possible_players = random.sample(players_to_schedule, 4)
        team1_players, team2_players = possible_players[:2], possible_players[2:4]

        if team_already_scheduled_before(
            team1_players[0], team1_players[1]
        ) or team_already_scheduled_before(team2_players[0], team2_players[1]):
            continue

        team1 = TeamWithPlayers(players=team1_players)
        team2 = TeamWithPlayers(players=team2_players)

        suggested_match = check_team_combination_adheres_to_filter(team1, team2, filter_)
        if suggested_match:
            suggested_match.player_behind_schedule_count = sum(
                1 if player.id in player_ids_behind_schedule else 0
                for player in team1_players + team2_players
            )
            suggestions.add(suggested_match)

    result = sorted(
        list(suggestions),
        key=lambda s: s.elo_diff - (int(1e9) * s.player_behind_schedule_count),
    )
    for i in range(min(max_matches_per_round, len(result))):
        result[i].is_recommended = True

    team_already_scheduled_before.cache_clear()
    return result[: filter_.limit]
