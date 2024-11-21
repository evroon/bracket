from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.stage_item_inputs import StageItemInput


def get_suggested_match(
    stage_item_input1: StageItemInput,
    stage_item_input2: StageItemInput,
    times_played_sum: int,
) -> SuggestedMatch:
    elo_diff = abs(stage_item_input1.elo - stage_item_input2.elo)
    swiss_diff = abs(stage_item_input1.points - stage_item_input2.points)

    return SuggestedMatch(
        stage_item_input1=stage_item_input1,
        stage_item_input2=stage_item_input2,
        elo_diff=elo_diff,
        swiss_diff=swiss_diff,
        is_recommended=False,
        times_played_sum=times_played_sum,
        player_behind_schedule_count=0,
    )


def check_input_combination_adheres_to_filter(
    stage_item_input1: StageItemInput,
    stage_item_input2: StageItemInput,
    filter_: MatchFilter,
    times_played_sum: int,
) -> SuggestedMatch | None:
    suggested_match = get_suggested_match(
        stage_item_input1,
        stage_item_input2,
        times_played_sum,
    )

    if suggested_match.elo_diff <= filter_.elo_diff_threshold:
        return suggested_match

    return None
