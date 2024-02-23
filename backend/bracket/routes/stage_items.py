from fastapi import APIRouter, Depends, HTTPException
from starlette import status

from bracket.database import database
from bracket.logic.planning.rounds import (
    MatchTimingAdjustmentInfeasible,
    get_active_and_next_rounds,
    schedule_all_matches_for_swiss_round,
)
from bracket.logic.ranking.elo import recalculate_ranking_for_tournament_id
from bracket.logic.scheduling.builder import (
    build_matches_for_stage_item,
)
from bracket.logic.subscriptions import check_requirement
from bracket.models.db.stage_item import (
    StageItemActivateNextBody,
    StageItemCreateBody,
    StageItemUpdateBody,
)
from bracket.models.db.user import UserPublic
from bracket.models.db.util import StageItemWithRounds
from bracket.routes.auth import (
    user_authenticated_for_tournament,
)
from bracket.routes.models import SuccessResponse
from bracket.routes.util import stage_item_dependency
from bracket.sql.rounds import set_round_active_or_draft
from bracket.sql.shared import sql_delete_stage_item_with_foreign_keys
from bracket.sql.stage_items import (
    get_stage_item,
    sql_create_stage_item,
)
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.validation import check_foreign_keys_belong_to_tournament
from bracket.utils.id_types import StageItemId, TournamentId

router = APIRouter()


@router.delete(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}", response_model=SuccessResponse
)
async def delete_stage_item(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage_item: StageItemWithRounds = Depends(stage_item_dependency),
) -> SuccessResponse:
    await sql_delete_stage_item_with_foreign_keys(stage_item_id)
    await recalculate_ranking_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/stage_items", response_model=SuccessResponse)
async def create_stage_item(
    tournament_id: TournamentId,
    stage_body: StageItemCreateBody,
    user: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    if stage_body.team_count != len(stage_body.inputs):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team count doesn't match number of inputs",
        )

    await check_foreign_keys_belong_to_tournament(stage_body, tournament_id)

    stages = await get_full_tournament_details(tournament_id)
    existing_stage_items = [stage_item for stage in stages for stage_item in stage.stage_items]
    check_requirement(existing_stage_items, user, "max_stage_items")

    stage_item = await sql_create_stage_item(tournament_id, stage_body)
    await build_matches_for_stage_item(stage_item, tournament_id)
    return SuccessResponse()


@router.put(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}", response_model=SuccessResponse
)
async def update_stage_item(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    stage_item_body: StageItemUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    stage_item: StageItemWithRounds = Depends(stage_item_dependency),
) -> SuccessResponse:
    if await get_stage_item(tournament_id, stage_item_id) is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not find all stages",
        )

    query = """
        UPDATE stage_items
        SET name = :name
        WHERE stage_items.id = :stage_item_id
    """
    await database.execute(
        query=query,
        values={"stage_item_id": stage_item_id, "name": stage_item_body.name},
    )
    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/stage_items/{stage_item_id}/start_next_round",
    response_model=SuccessResponse,
)
async def start_next_round(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
    active_next_body: StageItemActivateNextBody,
    stage_item: StageItemWithRounds = Depends(stage_item_dependency),
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    __, next_round = get_active_and_next_rounds(stage_item)
    if next_round is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "There is no next round in this stage item, please create one "
                "(after the current active round if there is an active round)"
            ),
        )

    try:
        await schedule_all_matches_for_swiss_round(
            tournament_id, next_round, active_next_body.adjust_to_time
        )
    except MatchTimingAdjustmentInfeasible as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    assert next_round.id is not None
    await set_round_active_or_draft(next_round.id, tournament_id, is_active=True, is_draft=False)

    return SuccessResponse()
