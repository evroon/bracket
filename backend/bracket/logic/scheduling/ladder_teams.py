import random
from collections import defaultdict

from fastapi import HTTPException

from bracket.logic.scheduling.shared import check_team_combination_adheres_to_filter
from bracket.models.db.match import (
    MatchFilter,
    MatchWithDetailsDefinitive,
    SuggestedMatch,
    get_match_hash,
)
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import RoundWithMatches
from bracket.utils.id_types import TeamId
from bracket.utils.types import assert_some


def get_draft_round_team_ids(draft_round: RoundWithMatches) -> list[TeamId]:
    return [
        team_id
        for match in draft_round.matches
        if isinstance(match, MatchWithDetailsDefinitive)
        for team_id in match.team_ids
    ]


def get_previous_matches_hashes(rounds: list[RoundWithMatches]) -> frozenset[str]:
    return frozenset(
        [
            hash_
            for round_ in rounds
            for match in round_.matches
            if isinstance(match, MatchWithDetailsDefinitive)
            for hash_ in match.get_team_ids_hashes()
        ]
    )


def get_number_of_teams_played_per_team(
    rounds: list[RoundWithMatches], excluded_team_ids: frozenset[TeamId]
) -> dict[int, int]:
    result: dict[int, int] = defaultdict(int)

    for round_ in rounds:
        for match in round_.matches:
            if isinstance(match, MatchWithDetailsDefinitive):
                for team in match.teams:
                    if team.active and team.id not in excluded_team_ids:
                        result[assert_some(team.id)] += 1

    return result


def get_possible_upcoming_matches_for_swiss(
    filter_: MatchFilter,
    rounds: list[RoundWithMatches],
    teams: list[FullTeamWithPlayers],
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    scheduled_hashes: list[str] = []
    draft_round = next((round_ for round_ in rounds if round_.is_draft), None)

    if draft_round is None:
        raise HTTPException(400, "There is no draft round, so no matches can be scheduled.")

    draft_round_team_ids = get_draft_round_team_ids(draft_round)
    teams_to_schedule = [
        team for team in teams if team.id not in draft_round_team_ids and team.active
    ]

    if len(teams_to_schedule) < 1:
        return []

    previous_match_team_hashes = get_previous_matches_hashes(rounds)
    times_played_per_team = dict(
        get_number_of_teams_played_per_team(
            rounds, excluded_team_ids=frozenset(draft_round_team_ids)
        )
    )
    for team in teams_to_schedule:
        if team.id not in times_played_per_team:
            times_played_per_team[assert_some(team.id)] = 0

    min_times_played = min(times_played_per_team.values()) if len(times_played_per_team) > 0 else 0

    teams1_random = random.choices(teams_to_schedule, k=filter_.iterations)
    teams2_random = random.choices(teams_to_schedule, k=filter_.iterations)

    for t1, t2 in zip(teams1_random, teams2_random):
        if assert_some(t1.id) > assert_some(t2.id):
            team2, team1 = t1, t2
        elif assert_some(t1.id) < assert_some(t2.id):
            team1, team2 = t1, t2
        else:
            continue

        match_hash = get_match_hash(team1.id, team2.id)
        if get_match_hash(team1.id, team2.id) in previous_match_team_hashes:
            continue

        times_played_min = min(
            times_played_per_team[assert_some(team1.id)],
            times_played_per_team[assert_some(team2.id)],
        )
        suggested_match = check_team_combination_adheres_to_filter(
            team1, team2, filter_, is_recommended=times_played_min <= min_times_played
        )
        if (
            suggested_match
            and match_hash not in scheduled_hashes
            and (not filter_.only_recommended or suggested_match.is_recommended)
        ):
            suggestions.append(suggested_match)
            scheduled_hashes.append(match_hash)
            scheduled_hashes.append(get_match_hash(team2.id, team1.id))

    sorted_by_elo = sorted(suggestions, key=lambda x: x.elo_diff)
    sorted_by_times_played = sorted(sorted_by_elo, key=lambda x: x.is_recommended, reverse=True)
    return sorted_by_times_played[: filter_.limit]
