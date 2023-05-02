from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.models.db.round import StageWithRounds
from bracket.models.db.stage import Stage, StageCreateBody, StageUpdateBody
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import RoundsWithMatchesResponse, SuccessResponse
from bracket.routes.util import stage_dependency
from bracket.sql.stages import (
    get_stages_with_rounds_and_matches,
    sql_create_stage,
    sql_delete_stage,
)

router = APIRouter()


@router.get("/tournaments/{tournament_id}/stages", response_model=RoundsWithMatchesResponse)
async def get_stages(
    tournament_id: int,
    user: UserPublic = Depends(user_authenticated_or_public_dashboard),
    no_draft_rounds: bool = False,
) -> RoundsWithMatchesResponse:
    if no_draft_rounds is False and user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can't view draft rounds when not authorized",
        )

    stages_ = await get_stages_with_rounds_and_matches(
        tournament_id, no_draft_rounds=no_draft_rounds
    )
    return RoundsWithMatchesResponse(data=stages_)


@router.delete("/tournaments/{tournament_id}/stages/{stage_id}", response_model=SuccessResponse)
async def delete_stage(
    tournament_id: int,
    stage_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage: StageWithRounds = Depends(stage_dependency),
) -> SuccessResponse:
    if len(stage.rounds) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Round contains matches, delete those first",
        )

    await sql_delete_stage(tournament_id, stage_id)

    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/stages", response_model=SuccessResponse)
async def create_stage(
    tournament_id: int,
    stage_body: StageCreateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await sql_create_stage(stage_body, tournament_id)
    return SuccessResponse()


@router.patch("/tournaments/{tournament_id}/stages/{stage_id}", response_model=SuccessResponse)
async def update_stage(
    tournament_id: int,
    stage_id: int,
    stage_body: StageUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage: Stage = Depends(stage_dependency),  # pylint: disable=redefined-builtin
) -> SuccessResponse:
    values = {'tournament_id': tournament_id, 'stage_id': stage_id}
    query = '''
        UPDATE stages
        SET is_active = :is_active
        WHERE stages.id = :stage_id
        AND stages.tournament_id = :tournament_id
    '''
    await database.execute(
        query=query,
        values={**values, 'is_active': stage_body.is_active},
    )
    return SuccessResponse()
