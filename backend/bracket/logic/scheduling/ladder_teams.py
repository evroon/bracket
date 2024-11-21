import itertools
import random
from collections import defaultdict

from bracket.logic.scheduling.shared import check_input_combination_adheres_to_filter
from bracket.models.db.match import (
    MatchFilter,
    MatchWithDetailsDefinitive,
    SuggestedMatch,
    get_match_hash,
)
from bracket.models.db.stage_item_inputs import StageItemInput, StageItemInputFinal
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
    # pylint: disable=too-many-branches,unsubscriptable-object
    suggestions: list[SuggestedMatch] = []
    scheduled_hashes: list[str] = []
    draft_round_input_ids = get_draft_round_input_ids(draft_round) if draft_round else frozenset()

    inputs_to_schedule = [
        input_
        for input_ in stage_item_inputs
        if input_.id not in draft_round_input_ids
        and (not isinstance(input_, StageItemInputFinal) or input_.team.active)
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

    # If there are more possible matches to schedule (N * (N - 1)) than iteration count, then
    # pick random combinations.
    # Otherwise, when there's not too many inputs, just take all possible combinations.
    # Note: `itertools.product` creates N * N results, so we look at N * N instead of N * (N - 1).
    # For example: iteration count: 2_000, number of inputs: 20. Then N * N = 380,
    # 380 is less than 2_000, so we just loop over all possible combinations.
    N = len(inputs_to_schedule)
    Item = tuple[StageItemInput, StageItemInput]
    inputs_iter: itertools.product[Item] | zip[Item]
    if N * N <= filter_.iterations:
        inputs1 = inputs_to_schedule.copy()
        inputs2 = inputs_to_schedule.copy()
        random.shuffle(inputs1)
        random.shuffle(inputs2)
        inputs_iter = itertools.product(inputs1, inputs2)
    else:
        inputs1 = random.choices(inputs_to_schedule, k=filter_.iterations)
        inputs2 = random.choices(inputs_to_schedule, k=filter_.iterations)
        inputs_iter = zip(inputs1, inputs2)

    for i1, i2 in inputs_iter:
        if assert_some(i1.id) > assert_some(i2.id):
            input2, input1 = i1, i2
        elif assert_some(i1.id) < assert_some(i2.id):
            input1, input2 = i1, i2
        else:
            continue

        match_hash = get_match_hash(input1.id, input2.id)
        if get_match_hash(input1.id, input2.id) in previous_match_input_hashes:
            continue

        suggested_match = check_input_combination_adheres_to_filter(
            input1,
            input2,
            filter_,
            times_played_per_input[input1.id] + times_played_per_input[input2.id],
        )
        if suggested_match and match_hash not in scheduled_hashes:
            suggestions.append(suggested_match)
            scheduled_hashes.append(match_hash)
            scheduled_hashes.append(get_match_hash(input2.id, input1.id))

    if len(suggestions) < 1:
        return []

    lowest_times_played_sum = min(sug.times_played_sum for sug in suggestions)
    for sug in suggestions:
        sug.is_recommended = sug.times_played_sum == lowest_times_played_sum

    if filter_.only_recommended:
        suggestions = [sug for sug in suggestions if sug.is_recommended]

    sorted_by_elo = sorted(suggestions, key=lambda x: x.elo_diff)
    sorted_by_times_played = sorted(sorted_by_elo, key=lambda x: x.times_played_sum)
    return sorted_by_times_played[: filter_.limit]
