from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.logic.scheduling.builder import (
    build_matches_for_stage_item,
)
from bracket.models.db.stage_item import StageItemCreateBody, StageItemUpdateBody
from bracket.models.db.user import UserPublic
from bracket.models.db.util import StageItemWithRounds
from bracket.routes.auth import (
    user_authenticated_for_tournament,
)
from bracket.routes.models import SuccessResponse
from bracket.routes.util import stage_item_dependency
from bracket.sql.matches import sql_delete_matches_for_stage_item_id
from bracket.sql.rounds import sql_delete_rounds_for_stage_item_id
from bracket.sql.stage_item_inputs import sql_delete_stage_item_inputs
from bracket.sql.stage_items import sql_create_stage_item, sql_delete_stage_item

router = APIRouter()


@router.delete(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}", response_model=SuccessResponse
)
async def delete_stage_item(
    tournament_id: int,
    stage_item_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage_item: StageItemWithRounds = Depends(stage_item_dependency),
) -> SuccessResponse:
    async with database.transaction():
        await sql_delete_matches_for_stage_item_id(stage_item_id)
        await sql_delete_rounds_for_stage_item_id(stage_item_id)
        await sql_delete_stage_item_inputs(stage_item_id)
        await sql_delete_stage_item(stage_item_id)

    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/stage_items", response_model=SuccessResponse)
async def create_stage_item(
    tournament_id: int,
    stage_body: StageItemCreateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    if stage_body.team_count != len(stage_body.inputs):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team count doesn't match number of inputs",
        )

    stage_item = await sql_create_stage_item(tournament_id, stage_body)
    await build_matches_for_stage_item(stage_item, tournament_id)
    return SuccessResponse()


@router.put(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}", response_model=SuccessResponse
)
async def update_stage_item(
    tournament_id: int,
    stage_item_id: int,
    stage_item_body: StageItemUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage_item: StageItemWithRounds = Depends(stage_item_dependency),
) -> SuccessResponse:
    query = '''
        UPDATE stage_items
        SET name = :name
        WHERE stage_items.id = :stage_item_id
    '''
    await database.execute(
        query=query,
        values={'stage_item_id': stage_item_id, 'name': stage_item_body.name},
    )
    return SuccessResponse()
