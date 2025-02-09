from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from bracket.database import database
from bracket.models.db.stage_item_inputs import (
    StageItemInput,
    StageItemInputUpdateBody,
    StageItemInputUpdateBodyFinal,
    StageItemInputUpdateBodyTentative,
)
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.models.db.util import StageItemWithRounds
from bracket.routes.auth import (
    user_authenticated_for_tournament,
)
from bracket.routes.models import SuccessResponse
from bracket.routes.util import disallow_archived_tournament, stage_item_dependency
from bracket.sql.stage_item_inputs import get_stage_item_input_by_id
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.teams import get_team_by_id
from bracket.utils.errors import (
    ForeignKey,
    UniqueIndex,
    check_foreign_key_violation,
    check_unique_constraint_violation,
)
from bracket.utils.id_types import StageItemId, StageItemInputId, TournamentId

router = APIRouter()


async def validate_stage_item_update(
    stage_item_input_db: StageItemInput | None,
    stage_item_input_body: StageItemInputUpdateBody,
    tournament_id: TournamentId,
) -> None:
    if stage_item_input_db is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not find the stage item input",
        )

    if isinstance(stage_item_input_body, StageItemInputUpdateBodyTentative):
        input_id = stage_item_input_body.winner_from_stage_item_id
        winner_from_stage = await get_full_tournament_details(
            tournament_id, stage_item_ids={input_id}
        )
        if winner_from_stage is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Could not find stage item with id {input_id}",
            )

    if (
        isinstance(stage_item_input_body, StageItemInputUpdateBodyFinal)
        and await get_team_by_id(stage_item_input_body.team_id, tournament_id) is None
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find team with id {stage_item_input_body.team_id}",
        )


@router.put(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}/inputs/{stage_item_input_id}",
    response_model=SuccessResponse,
)
async def update_stage_item_input(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    stage_item_input_id: StageItemInputId,
    stage_item_body: StageItemInputUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: StageItemWithRounds = Depends(stage_item_dependency),
    ___: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    stage_item_input = await get_stage_item_input_by_id(tournament_id, stage_item_input_id)
    await validate_stage_item_update(stage_item_input, stage_item_body, tournament_id)

    query = """
        UPDATE stage_item_inputs
        SET team_id = :team_id,
            winner_position = :winner_position,
            winner_from_stage_item_id = :winner_from_stage_item_id
        WHERE stage_item_inputs.id = :stage_item_input_id
        AND stage_item_inputs.tournament_id = :tournament_id
    """
    with (
        check_unique_constraint_violation(
            {
                UniqueIndex.stage_item_inputs_stage_item_id_team_id_key,
                UniqueIndex.stage_item_inputs_stage_item_id_winner_from_stage_item_id_w_key,
            },
        ),
        check_foreign_key_violation({ForeignKey.stage_item_inputs_team_id_fkey}),
    ):
        await database.execute(
            query=query,
            values={
                "tournament_id": tournament_id,
                "stage_item_input_id": stage_item_input_id,
                "team_id": stage_item_body.team_id
                if isinstance(stage_item_body, StageItemInputUpdateBodyFinal)
                else None,
                "winner_position": stage_item_body.winner_position
                if isinstance(stage_item_body, StageItemInputUpdateBodyTentative)
                else None,
                "winner_from_stage_item_id": stage_item_body.winner_from_stage_item_id
                if isinstance(stage_item_body, StageItemInputUpdateBodyTentative)
                else None,
            },
        )
    return SuccessResponse()
