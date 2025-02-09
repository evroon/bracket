from fastapi import APIRouter, Depends

from bracket.logic.ranking.calculation import recalculate_ranking_for_stage_item
from bracket.logic.ranking.elimination import (
    update_inputs_in_complete_elimination_stage_item,
)
from bracket.logic.subscriptions import check_requirement
from bracket.models.db.ranking import RankingBody, RankingCreateBody
from bracket.models.db.stage_item import StageType
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import (
    RankingsResponse,
    SuccessResponse,
)
from bracket.routes.util import disallow_archived_tournament
from bracket.sql.rankings import (
    get_all_rankings_in_tournament,
    sql_create_ranking,
    sql_delete_ranking,
    sql_update_ranking,
)
from bracket.sql.stage_item_inputs import get_stage_item_input_ids_by_ranking_id
from bracket.sql.stage_items import get_stage_item
from bracket.utils.id_types import RankingId, TournamentId

router = APIRouter()


@router.get("/tournaments/{tournament_id}/rankings")
async def get_rankings(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_or_public_dashboard),
) -> RankingsResponse:
    return RankingsResponse(data=await get_all_rankings_in_tournament(tournament_id))


@router.put("/tournaments/{tournament_id}/rankings/{ranking_id}")
async def update_ranking_by_id(
    tournament_id: TournamentId,
    ranking_id: RankingId,
    ranking_body: RankingBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    await sql_update_ranking(
        tournament_id=tournament_id,
        ranking_id=ranking_id,
        ranking_body=ranking_body,
    )
    stage_item_ids = await get_stage_item_input_ids_by_ranking_id(ranking_id)
    for stage_item_id in stage_item_ids:
        stage_item = await get_stage_item(tournament_id, stage_item_id)
        await recalculate_ranking_for_stage_item(tournament_id, stage_item)

        if stage_item.type == StageType.SINGLE_ELIMINATION:
            await update_inputs_in_complete_elimination_stage_item(stage_item)
    return SuccessResponse()


@router.delete("/tournaments/{tournament_id}/rankings/{ranking_id}")
async def delete_ranking(
    tournament_id: TournamentId,
    ranking_id: RankingId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    await sql_delete_ranking(tournament_id, ranking_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/rankings")
async def create_ranking(
    ranking_body: RankingCreateBody,
    tournament_id: TournamentId,
    user: UserPublic = Depends(user_authenticated_for_tournament),
    _: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    existing_rankings = await get_all_rankings_in_tournament(tournament_id)
    check_requirement(existing_rankings, user, "max_rankings")

    highest_position = (
        max(x.position for x in existing_rankings) if len(existing_rankings) > 0 else -1
    )
    await sql_create_ranking(tournament_id, ranking_body, highest_position + 1)
    return SuccessResponse()
