from bracket.logic.matches import create_match_and_assign_free_court
from bracket.models.db.match import Match, MatchCreateBody
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.sql.rounds import get_rounds_for_stage_item
from bracket.utils.types import assert_some


def determine_matches_first_round(
    round_: RoundWithMatches, stage_item: StageItemWithRounds
) -> list[MatchCreateBody]:
    suggestions: list[MatchCreateBody] = []

    for i in range(0, len(stage_item.inputs), 2):
        first_input = stage_item.inputs[i + 0]
        second_input = stage_item.inputs[i + 1]
        suggestions.append(
            MatchCreateBody(
                round_id=assert_some(round_.id),
                court_id=None,
                team1_id=first_input.team_id,
                team1_winner_from_stage_item_id=first_input.winner_from_stage_item_id,
                team1_winner_position_in_stage_item=first_input.winner_position_in_stage_item,
                team1_winner_from_match_id=first_input.winner_from_match_id,
                team2_id=second_input.team_id,
                team2_winner_from_stage_item_id=second_input.winner_from_stage_item_id,
                team2_winner_position_in_stage_item=second_input.winner_position_in_stage_item,
                team2_winner_from_match_id=second_input.winner_from_match_id,
            )
        )

    return suggestions


def determine_matches_subsequent_round(
    prev_matches: list[Match],
    round_: RoundWithMatches,
) -> list[MatchCreateBody]:
    suggestions: list[MatchCreateBody] = []

    for i in range(0, len(prev_matches), 2):
        first_match = prev_matches[i + 0]
        second_match = prev_matches[i + 1]

        suggestions.append(
            MatchCreateBody(
                round_id=assert_some(round_.id),
                court_id=None,
                team1_id=None,
                team1_winner_from_stage_item_id=None,
                team1_winner_position_in_stage_item=None,
                team2_id=None,
                team2_winner_from_stage_item_id=None,
                team2_winner_position_in_stage_item=None,
                team1_winner_from_match_id=assert_some(first_match.id),
                team2_winner_from_match_id=assert_some(second_match.id),
            )
        )
    return suggestions


async def build_single_elimination_stage_item(
    tournament_id: int, stage_item: StageItemWithRounds
) -> None:
    rounds = await get_rounds_for_stage_item(tournament_id, stage_item.id)
    assert len(rounds) > 0
    first_round = rounds[0]

    prev_matches = [
        await create_match_and_assign_free_court(tournament_id, match)
        for match in determine_matches_first_round(first_round, stage_item)
    ]

    for round_ in rounds[1:]:
        prev_matches = [
            await create_match_and_assign_free_court(tournament_id, match)
            for match in determine_matches_subsequent_round(prev_matches, round_)
        ]


def get_number_of_rounds_to_create_single_elimination(team_count: int) -> int:
    if team_count < 1:
        return 0

    assert team_count % 2 == 0

    game_count_lookup = {
        2: 1,
        4: 2,
        8: 3,
        16: 4,
    }
    return game_count_lookup[team_count]
