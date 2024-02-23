from fastapi import HTTPException

from bracket.logic.scheduling.elimination import (
    build_single_elimination_stage_item,
    get_number_of_rounds_to_create_single_elimination,
)
from bracket.logic.scheduling.round_robin import (
    build_round_robin_stage_item,
    get_number_of_rounds_to_create_round_robin,
)
from bracket.models.db.round import RoundToInsert
from bracket.models.db.stage_item import StageItem, StageType
from bracket.models.db.stage_item_inputs import (
    StageItemInputOptionFinal,
    StageItemInputOptionTentative,
)
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import StageWithStageItems
from bracket.sql.rounds import get_next_round_name, sql_create_round
from bracket.sql.stage_items import get_stage_item
from bracket.utils.id_types import StageId, TournamentId
from bracket.utils.types import assert_some


async def create_rounds_for_new_stage_item(
    tournament_id: TournamentId, stage_item: StageItem
) -> None:
    rounds_count: int
    match stage_item.type:
        case StageType.ROUND_ROBIN:
            rounds_count = get_number_of_rounds_to_create_round_robin(stage_item.team_count)
        case StageType.SINGLE_ELIMINATION:
            rounds_count = get_number_of_rounds_to_create_single_elimination(stage_item.team_count)
        case StageType.SWISS:
            return None
        case other:
            raise NotImplementedError(f"No round creation implementation for {other}")

    for _ in range(rounds_count):
        await sql_create_round(
            RoundToInsert(
                stage_item_id=assert_some(stage_item.id),
                name=await get_next_round_name(tournament_id, assert_some(stage_item.id)),
            ),
        )


async def build_matches_for_stage_item(stage_item: StageItem, tournament_id: TournamentId) -> None:
    await create_rounds_for_new_stage_item(tournament_id, stage_item)
    stage_item_with_rounds = await get_stage_item(tournament_id, assert_some(stage_item.id))

    if stage_item_with_rounds is None:
        raise ValueError(
            f"Could not find stage item with id {stage_item.id} for tournament {tournament_id}"
        )

    match stage_item.type:
        case StageType.ROUND_ROBIN:
            await build_round_robin_stage_item(tournament_id, stage_item_with_rounds)
        case StageType.SINGLE_ELIMINATION:
            await build_single_elimination_stage_item(tournament_id, stage_item_with_rounds)
        case StageType.SWISS:
            return None

        case _:
            raise HTTPException(
                400, f"Cannot automatically create matches for stage type {stage_item.type}"
            )


def determine_available_inputs(
    stage_id: StageId,
    teams: list[FullTeamWithPlayers],
    stages: list[StageWithStageItems],
) -> list[StageItemInputOptionTentative | StageItemInputOptionFinal]:
    results_team_ids = [assert_some(team.id) for team in teams]
    results_tentative = []

    for stage in stages:
        if stage_id == stage.id:
            break

        for stage_item in stage.stage_items:
            item_team_id_inputs = [
                input.team_id for input in stage_item.inputs if input.team_id is not None
            ]
            for input_ in item_team_id_inputs:
                if input_ in results_team_ids:
                    results_team_ids.remove(input_)

            for winner_position in range(1, 5):
                results_tentative.append(
                    StageItemInputOptionTentative(
                        winner_from_stage_item_id=stage_item.id, winner_position=winner_position
                    )
                )

    results_final = [StageItemInputOptionFinal(team_id=team_id) for team_id in results_team_ids]
    return results_final + results_tentative
