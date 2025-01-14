from collections import defaultdict

from fastapi import HTTPException
from pydantic import BaseModel
from starlette import status

from bracket.logic.ranking.calculation import (
    determine_team_ranking_for_stage_item,
)
from bracket.logic.ranking.statistics import TeamStatistics
from bracket.models.db.stage_item_inputs import (
    StageItemInputEmpty,
    StageItemInputFinal,
    StageItemInputTentative,
)
from bracket.models.db.team import Team
from bracket.models.db.util import StageWithStageItems
from bracket.sql.matches import clear_scores_for_matches_in_stage_item
from bracket.sql.rankings import get_ranking_for_stage_item
from bracket.sql.stage_item_inputs import (
    get_stage_item_input_by_id,
    sql_set_team_id_for_stage_item_input,
)
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import (
    StageId,
    StageItemId,
    StageItemInputId,
    TournamentId,
)
from bracket.utils.types import assert_some

StageItemXTeamRanking = dict[StageItemId, list[tuple[StageItemInputId, TeamStatistics]]]


class StageItemInputUpdate(BaseModel):
    stage_item_input: StageItemInputTentative
    team: Team


def determine_team_id(
    winner_from_stage_item_id: StageItemId,
    winner_position: int,
    stage_item_x_team_rankings: StageItemXTeamRanking,
) -> StageItemInputId:
    """
    Determine the team ID for a stage item input that didn't have a team assigned yet.

    Returns a team that was chosen from a previous stage item ranking.
    """

    team_ranking = stage_item_x_team_rankings[winner_from_stage_item_id]
    msg = (
        "Winner position is out of range of ranking of previous stage item. "
        f"Ranking has size: {len(team_ranking)}, winner position: {winner_position}"
    )
    assert len(team_ranking) >= winner_position, msg
    return team_ranking[winner_position - 1][0]


async def get_team_update_for_input(
    tournament_id: TournamentId,
    stage_item_input: StageItemInputTentative,
    stage_item_x_team_rankings: StageItemXTeamRanking,
) -> StageItemInputUpdate:
    target_stage_item_input_id = determine_team_id(
        stage_item_input.winner_from_stage_item_id,
        stage_item_input.winner_position,
        stage_item_x_team_rankings,
    )
    target_stage_item_input = await get_stage_item_input_by_id(
        tournament_id, target_stage_item_input_id
    )
    if isinstance(target_stage_item_input, StageItemInputEmpty):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please first assign teams to all stage items in the current stage.",
        )

    assert isinstance(target_stage_item_input, StageItemInputFinal), (
        f"Unexpected stage item type: {type(target_stage_item_input)}"
    )
    return StageItemInputUpdate(
        stage_item_input=stage_item_input, team=target_stage_item_input.team
    )


async def get_team_rankings_lookup_for_tournament(
    tournament_id: TournamentId, stages: list[StageWithStageItems]
) -> StageItemXTeamRanking:
    stage_items = {
        stage_item.id: stage_item for stage in stages for stage_item in stage.stage_items
    }
    return {
        stage_item_id: determine_team_ranking_for_stage_item(
            stage_item,
            assert_some(await get_ranking_for_stage_item(tournament_id, stage_item.id)),
        )
        for stage_item_id, stage_item in stage_items.items()
    }


async def get_updates_to_inputs_in_activated_stage(
    tournament_id: TournamentId, stage_id: StageId
) -> dict[StageItemId, list[StageItemInputUpdate]]:
    """
    Gets the team_id updates for stage item inputs of the newly activated stage.
    """
    stages = await get_full_tournament_details(tournament_id)
    team_rankings_per_stage_item = await get_team_rankings_lookup_for_tournament(
        tournament_id, stages
    )
    activated_stage = next((stage for stage in stages if stage.id == stage_id), None)
    assert activated_stage

    result = defaultdict(list)

    for stage_item in activated_stage.stage_items:
        for stage_item_input in stage_item.inputs:
            if isinstance(stage_item_input, StageItemInputTentative):
                result[stage_item.id].append(
                    await get_team_update_for_input(
                        tournament_id, stage_item_input, team_rankings_per_stage_item
                    )
                )

    return dict(result)


async def update_matches_in_activated_stage(tournament_id: TournamentId, stage_id: StageId) -> None:
    """
    Sets the team_id for stage item inputs of the newly activated stage.
    """
    updates_per_stage_item = await get_updates_to_inputs_in_activated_stage(tournament_id, stage_id)
    for stage_item_updates in updates_per_stage_item.values():
        for update in stage_item_updates:
            await sql_set_team_id_for_stage_item_input(
                tournament_id, update.stage_item_input.id, update.team.id
            )


async def update_matches_in_deactivated_stage(
    tournament_id: TournamentId, deactivated_stage: StageWithStageItems
) -> None:
    """
    Unsets the team_id for stage item inputs of the newly deactivated stage.
    """
    for stage_item in deactivated_stage.stage_items:
        await clear_scores_for_matches_in_stage_item(tournament_id, stage_item.id)

        for stage_item_input in stage_item.inputs:
            if stage_item_input.winner_from_stage_item_id is not None:
                await sql_set_team_id_for_stage_item_input(tournament_id, stage_item_input.id, None)
