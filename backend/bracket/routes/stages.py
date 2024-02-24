from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from bracket.database import database
from bracket.logic.ranking.elo import recalculate_ranking_for_tournament_id
from bracket.logic.scheduling.builder import determine_available_inputs
from bracket.logic.scheduling.handle_stage_activation import update_matches_in_activated_stage
from bracket.logic.subscriptions import check_requirement
from bracket.models.db.stage import Stage, StageActivateBody, StageUpdateBody
from bracket.models.db.user import UserPublic
from bracket.models.db.util import StageWithStageItems
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import (
    StageItemInputOptionsResponse,
    StagesWithStageItemsResponse,
    SuccessResponse,
)
from bracket.routes.util import stage_dependency
from bracket.sql.stages import (
    get_full_tournament_details,
    get_next_stage_in_tournament,
    sql_activate_next_stage,
    sql_create_stage,
    sql_delete_stage,
)
from bracket.sql.teams import get_teams_with_members
from bracket.utils.id_types import StageId, TournamentId

router = APIRouter()


@router.get("/tournaments/{tournament_id}/stages", response_model=StagesWithStageItemsResponse)
async def get_stages(
    tournament_id: TournamentId,
    user: UserPublic = Depends(user_authenticated_or_public_dashboard),
    no_draft_rounds: bool = False,
) -> StagesWithStageItemsResponse:
    if no_draft_rounds is False and user is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Can't view draft rounds when not authorized",
        )

    stages_ = await get_full_tournament_details(tournament_id, no_draft_rounds=no_draft_rounds)
    return StagesWithStageItemsResponse(data=stages_)


@router.delete("/tournaments/{tournament_id}/stages/{stage_id}", response_model=SuccessResponse)
async def delete_stage(
    tournament_id: TournamentId,
    stage_id: StageId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage: StageWithStageItems = Depends(stage_dependency),
) -> SuccessResponse:
    if len(stage.stage_items) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stage contains stage items, please delete those first",
        )

    if stage.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stage is active, please activate another stage first",
        )

    await sql_delete_stage(tournament_id, stage_id)

    await recalculate_ranking_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/stages", response_model=SuccessResponse)
async def create_stage(
    tournament_id: TournamentId,
    user: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    existing_stages = await get_full_tournament_details(tournament_id)
    check_requirement(existing_stages, user, "max_stages")

    await sql_create_stage(tournament_id)
    return SuccessResponse()


@router.put("/tournaments/{tournament_id}/stages/{stage_id}", response_model=SuccessResponse)
async def update_stage(
    tournament_id: TournamentId,
    stage_id: StageId,
    stage_body: StageUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage: Stage = Depends(stage_dependency),  # pylint: disable=redefined-builtin
) -> SuccessResponse:
    values = {"tournament_id": tournament_id, "stage_id": stage_id}
    query = """
        UPDATE stages
        SET name = :name
        WHERE stages.id = :stage_id
        AND stages.tournament_id = :tournament_id
    """
    await database.execute(
        query=query,
        values={**values, "name": stage_body.name},
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/stages/activate", response_model=SuccessResponse)
async def activate_next_stage(
    tournament_id: TournamentId,
    stage_body: StageActivateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    new_active_stage_id = await get_next_stage_in_tournament(tournament_id, stage_body.direction)
    if new_active_stage_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"There is no {stage_body.direction} stage",
        )

    await sql_activate_next_stage(new_active_stage_id, tournament_id)
    if stage_body.direction == "next":
        await update_matches_in_activated_stage(tournament_id, new_active_stage_id)
    return SuccessResponse()


@router.get(
    "/tournaments/{tournament_id}/stages/{stage_id}/available_inputs",
    response_model=StageItemInputOptionsResponse,
)
async def get_available_inputs(
    tournament_id: TournamentId,
    stage_id: StageId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage: Stage = Depends(stage_dependency),
) -> StageItemInputOptionsResponse:
    stages = await get_full_tournament_details(tournament_id)
    teams = await get_teams_with_members(tournament_id)
    available_inputs = determine_available_inputs(stage_id, teams, stages)
    return StageItemInputOptionsResponse(data=available_inputs)
