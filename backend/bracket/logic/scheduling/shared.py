from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.stage_item_inputs import StageItemInputFinal


def get_suggested_match(
    stage_item_input1: StageItemInputFinal,
    stage_item_input2: StageItemInputFinal,
    is_recommended: bool,
) -> SuggestedMatch:
    elo_diff = abs(stage_item_input1.elo - stage_item_input2.elo)
    swiss_diff = abs(stage_item_input1.points - stage_item_input2.points)

    return SuggestedMatch(
        stage_item_input1=stage_item_input1,
        stage_item_input2=stage_item_input2,
        elo_diff=elo_diff,
        swiss_diff=swiss_diff,
        is_recommended=is_recommended,
        player_behind_schedule_count=0,
    )


def check_input_combination_adheres_to_filter(
    stage_item_input1: StageItemInputFinal,
    stage_item_input2: StageItemInputFinal,
    filter_: MatchFilter,
    is_recommended: bool,
) -> SuggestedMatch | None:
    suggested_match = get_suggested_match(stage_item_input1, stage_item_input2, is_recommended)

    if suggested_match.elo_diff <= filter_.elo_diff_threshold:
        return suggested_match

    return None
