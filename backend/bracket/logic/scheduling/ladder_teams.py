import random
from collections import defaultdict

from bracket.logic.scheduling.shared import check_input_combination_adheres_to_filter
from bracket.models.db.match import (
    MatchFilter,
    MatchWithDetailsDefinitive,
    SuggestedMatch,
    get_match_hash,
)
from bracket.models.db.stage_item_inputs import StageItemInput
from bracket.models.db.util import RoundWithMatches
from bracket.utils.id_types import StageItemInputId
from bracket.utils.types import assert_some


def get_draft_round_input_ids(draft_round: RoundWithMatches) -> frozenset[StageItemInputId]:
    return frozenset(
        {
            stage_item_input_id
            for match in draft_round.matches
            if isinstance(match, MatchWithDetailsDefinitive)
            for stage_item_input_id in match.stage_item_input_ids
        }
    )


def get_previous_matches_hashes(rounds: list[RoundWithMatches]) -> frozenset[str]:
    return frozenset(
        [
            hash_
            for round_ in rounds
            for match in round_.matches
            if isinstance(match, MatchWithDetailsDefinitive)
            for hash_ in match.get_input_ids_hashes()
        ]
    )


def get_number_of_inputs_played_per_input(
    rounds: list[RoundWithMatches], excluded_input_ids: frozenset[StageItemInputId]
) -> dict[int, int]:
    result: dict[int, int] = defaultdict(int)

    for round_ in rounds:
        for match in round_.matches:
            if isinstance(match, MatchWithDetailsDefinitive):
                for input_ in match.stage_item_inputs:
                    if input_.id not in excluded_input_ids:
                        result[input_.id] += 1

    return result


def get_possible_upcoming_matches_for_swiss(
    filter_: MatchFilter,
    rounds: list[RoundWithMatches],
    stage_item_inputs: list[StageItemInput],
    draft_round: RoundWithMatches | None = None,
) -> list[SuggestedMatch]:
    suggestions: list[SuggestedMatch] = []
    scheduled_hashes: list[str] = []
    draft_round_input_ids = get_draft_round_input_ids(draft_round) if draft_round else frozenset()

    inputs_to_schedule = [
        input_ for input_ in stage_item_inputs if input_.id not in draft_round_input_ids
    ]

    if len(inputs_to_schedule) < 1:
        return []

    previous_match_input_hashes = get_previous_matches_hashes(rounds)
    times_played_per_input = get_number_of_inputs_played_per_input(
        rounds, excluded_input_ids=draft_round_input_ids
    )

    for input_ in inputs_to_schedule:
        if input_.id not in times_played_per_input:
            times_played_per_input[input_.id] = 0

    min_times_played = (
        min(times_played_per_input.values()) if len(times_played_per_input) > 0 else 0
    )

    inputs1_random = random.choices(inputs_to_schedule, k=filter_.iterations)
    inputs2_random = random.choices(inputs_to_schedule, k=filter_.iterations)

    for i1, i2 in zip(inputs1_random, inputs2_random):
        if assert_some(i1.id) > assert_some(i2.id):
            input2, input1 = i1, i2
        elif assert_some(i1.id) < assert_some(i2.id):
            input1, input2 = i1, i2
        else:
            continue

        match_hash = get_match_hash(input1.id, input2.id)
        if get_match_hash(input1.id, input2.id) in previous_match_input_hashes:
            continue

        times_played_min = min(
            times_played_per_input[input1.id],
            times_played_per_input[input2.id],
        )
        suggested_match = check_input_combination_adheres_to_filter(
            input1, input2, filter_, is_recommended=times_played_min <= min_times_played
        )
        if (
            suggested_match
            and match_hash not in scheduled_hashes
            and (not filter_.only_recommended or suggested_match.is_recommended)
        ):
            suggestions.append(suggested_match)
            scheduled_hashes.append(match_hash)
            scheduled_hashes.append(get_match_hash(input2.id, input1.id))

    sorted_by_elo = sorted(suggestions, key=lambda x: x.elo_diff)
    sorted_by_times_played = sorted(sorted_by_elo, key=lambda x: x.is_recommended, reverse=True)
    return sorted_by_times_played[: filter_.limit]
