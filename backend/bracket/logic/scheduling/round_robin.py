from bracket.models.db.match import (
    MatchCreateBody,
)
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.matches import sql_create_match
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.id_types import TournamentId
from bracket.utils.types import assert_some


def get_round_robin_combinations(team_count: int) -> list[list[tuple[int, int]]]:
    # Based on: https://en.wikipedia.org/wiki/Round-robin_tournament#Python
    # If there is an odd amount of teams,
    # there will be 1 more 'non-existent' team, standing for no match-up
    rounds = team_count - 1
    if team_count % 2 == 1:
        rounds = team_count
    # Matches per round
    mpr = int((rounds + 1) / 2)

    # Table of teams [1, 2, ..., n]
    t = []
    for i in range(rounds + 1):
        t.append(i)

    # Stores the rounds with the corresponding matches inside
    # e.g.: [[(1, 4), (2, 3)], [(1, 3), (4, 2)], [(1, 2), (3, 4)]]
    matches: list[list[tuple[int, int]]] = []
    for r in range(rounds):
        matches.append([])
        for m in range(mpr):
            matches[r].append((t[m], t[-1 - m]))
        t.remove(rounds - r)
        t.insert(1, rounds - r)

    return matches


async def build_round_robin_stage_item(
    tournament_id: TournamentId, stage_item: StageItemWithRounds
) -> None:
    matches = get_round_robin_combinations(len(stage_item.inputs))
    tournament = await sql_get_tournament(tournament_id)

    for i, round_ in enumerate(stage_item.rounds):
        for team_1_id, team_2_id in matches[i]:
            if team_1_id < len(stage_item.inputs) and team_2_id < len(stage_item.inputs):
                team_1, team_2 = stage_item.inputs[team_1_id], stage_item.inputs[team_2_id]

                match = MatchCreateBody(
                    round_id=assert_some(round_.id),
                    team1_id=team_1.team_id,
                    team1_winner_from_stage_item_id=team_1.winner_from_stage_item_id,
                    team1_winner_position=team_1.winner_position,
                    team1_winner_from_match_id=team_1.winner_from_match_id,
                    team2_id=team_2.team_id,
                    team2_winner_from_stage_item_id=team_2.winner_from_stage_item_id,
                    team2_winner_position=team_2.winner_position,
                    team2_winner_from_match_id=team_2.winner_from_match_id,
                    court_id=None,
                    duration_minutes=tournament.duration_minutes,
                    margin_minutes=tournament.margin_minutes,
                    custom_duration_minutes=None,
                    custom_margin_minutes=None,
                )
                await sql_create_match(match)


def get_number_of_rounds_to_create_round_robin(team_count: int) -> int:
    if team_count < 1:
        return 0

    # concurrency = team_count // 2
    # number_of_games = (team_count - 1) * math.floor(team_count / 2)
    return team_count - 1 if team_count % 2 == 0 else team_count
