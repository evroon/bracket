from fastapi import HTTPException
from starlette import status

from bracket.models.db.stage_item import StageItemCreateBody
from bracket.models.db.stage_item_inputs import (
    StageItemInputCreateBodyFinal,
    StageItemInputCreateBodyTentative,
)
from bracket.sql.stage_items import get_stage_items
from bracket.sql.teams import get_teams_by_id
from bracket.utils.id_types import TournamentId


async def check_inputs_belong_to_tournament(
    stage_body: StageItemCreateBody, tournament_id: TournamentId
) -> None:
    teams = {
        input_.team_id
        for input_ in stage_body.inputs
        if isinstance(input_, StageItemInputCreateBodyFinal)
    }
    teams_fetched = await get_teams_by_id(teams, tournament_id)
    stage_items = {
        input_.winner_from_stage_item_id
        for input_ in stage_body.inputs
        if isinstance(input_, StageItemInputCreateBodyTentative)
    }
    stage_items_fetched = await get_stage_items(tournament_id, stage_items)
    if len(teams) != len(teams_fetched) or len(stage_items) != len(stage_items_fetched):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not find all team ids or stages",
        )
