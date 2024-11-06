from fastapi import HTTPException

from bracket.logic.scheduling.elimination import (
    build_single_elimination_stage_item,
    get_number_of_rounds_to_create_single_elimination,
)
from bracket.logic.scheduling.round_robin import (
    build_round_robin_stage_item,
    get_number_of_rounds_to_create_round_robin,
)
from bracket.models.db.round import RoundInsertable
from bracket.models.db.stage_item import StageItem, StageType
from bracket.models.db.stage_item_inputs import (
    StageItemInputOptionFinal,
    StageItemInputOptionTentative,
)
from bracket.models.db.team import FullTeamWithPlayers
from bracket.models.db.util import StageWithStageItems
from bracket.sql.rounds import get_next_round_name, sql_create_round
from bracket.sql.stage_items import get_stage_item
from bracket.utils.id_types import StageId, StageItemId, TournamentId
from tests.integration_tests.mocks import MOCK_NOW


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
            RoundInsertable(
                created=MOCK_NOW,
                is_draft=False,
                stage_item_id=stage_item.id,
                name=await get_next_round_name(tournament_id, stage_item.id),
            ),
        )


async def build_matches_for_stage_item(stage_item: StageItem, tournament_id: TournamentId) -> None:
    await create_rounds_for_new_stage_item(tournament_id, stage_item)
    stage_item_with_rounds = await get_stage_item(tournament_id, stage_item.id)

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
    teams: list[FullTeamWithPlayers],
    stages: list[StageWithStageItems],
) -> dict[StageId, list[StageItemInputOptionTentative | StageItemInputOptionFinal]]:
    """
    Returns available inputs for the given stage.

    Inputs are either from:
    - Teams directly
    - Previous ROUND_ROBIN stage items
    """
    results_team_ids = {team.id: False for team in teams}
    results_tentative: dict[tuple[StageItemId, int], StageItemInputOptionTentative] = {}
    results = {}

    for stage in stages:
        # First, set options that are used in this round to have `already_taken=True`
        for stage_item in stage.stage_items:
            for input_ in stage_item.inputs:
                if input_.team_id is not None and input_.team_id in results_team_ids:
                    results_team_ids[input_.team_id] = True

                if (
                    input_.winner_from_stage_item_id is not None
                    and input_.winner_position is not None
                    and (key := (input_.winner_from_stage_item_id, input_.winner_position))
                    in results_tentative
                ):
                    results_tentative[key].already_taken = True

        # Store results for this stage
        results_final = [
            StageItemInputOptionFinal(team_id=team_id, already_taken=taken)
            for team_id, taken in results_team_ids.items()
        ]
        results[stage.id] = results_final + list(results_tentative.values())

        # Then, add inputs from non-elimination stage items that can be used in the next stage.
        for stage_item in stage.stage_items:
            if stage_item.type in {StageType.ROUND_ROBIN, StageType.SWISS}:
                for winner_position in range(1, 5):
                    results_tentative[(stage_item.id, winner_position)] = (
                        StageItemInputOptionTentative(
                            winner_from_stage_item_id=stage_item.id,
                            winner_position=winner_position,
                            already_taken=False,
                        )
                    )

    return results
