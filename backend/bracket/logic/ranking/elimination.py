from bracket.models.db.match import Match
from bracket.models.db.stage_item_inputs import StageItemInput
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.matches import (
    sql_set_input_ids_for_match,
)
from bracket.utils.id_types import (
    MatchId,
    RoundId,
)


def get_inputs_to_update_in_subsequent_elimination_rounds(
    current_round_id: RoundId,
    stage_item: StageItemWithRounds,
    match_ids: set[MatchId] | None = None,
) -> dict[MatchId, Match]:
    """
    Determine the updates of stage item input IDs in the elimination tree.

    Crucial aspect is that entering a winner for a match will influence matches of subsequent
    rounds, because of the tree-like structure of elimination stage items.
    """
    current_round = next(round_ for round_ in stage_item.rounds if round_.id == current_round_id)
    affected_matches: dict[MatchId, Match] = {
        match.id: match
        for match in current_round.matches
        if match_ids is None or match.id in match_ids
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
        match_id: match
        for match_id, match in affected_matches.items()
        if match_ids is None or match.id not in match_ids
    }


async def update_inputs_in_subsequent_elimination_rounds(
    current_round_id: RoundId,
    stage_item: StageItemWithRounds,
    match_ids: set[MatchId] | None = None,
) -> None:
    updates = get_inputs_to_update_in_subsequent_elimination_rounds(
        current_round_id, stage_item, match_ids
    )
    for _, match in updates.items():
        await sql_set_input_ids_for_match(
            match.round_id, match.id, [match.stage_item_input1_id, match.stage_item_input2_id]
        )


async def update_inputs_in_complete_elimination_stage_item(
    stage_item: StageItemWithRounds,
) -> None:
    for round_ in stage_item.rounds:
        await update_inputs_in_subsequent_elimination_rounds(round_.id, stage_item)
