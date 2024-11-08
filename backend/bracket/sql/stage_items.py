from fastapi import HTTPException
from starlette import status

from bracket.database import database
from bracket.models.db.stage_item import StageItem, StageItemCreateBody, StageItemWithInputsCreate
from bracket.models.db.stage_item_inputs import StageItemInputCreateBodyEmpty
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.rankings import get_default_rankings_in_tournament
from bracket.sql.stage_item_inputs import sql_create_stage_item_input
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import StageItemId, TournamentId


async def sql_create_stage_item(
    tournament_id: TournamentId, stage_item: StageItemCreateBody
) -> StageItem:
    query = """
            INSERT INTO stage_items (type, stage_id, name, team_count, ranking_id)
            VALUES (:stage_item_type, :stage_id, :name, :team_count, :ranking_id)
            RETURNING *
            """
    result = await database.fetch_one(
        query=query,
        values={
            "stage_item_type": stage_item.type.value,
            "stage_id": stage_item.stage_id,
            "name": stage_item.get_name_or_default_name(),
            "team_count": stage_item.team_count,
            "ranking_id": stage_item.ranking_id
            if stage_item.ranking_id
            else (await get_default_rankings_in_tournament(tournament_id)).id,
        },
    )
    if result is None:
        raise ValueError("Could not create stage")

    return StageItem.model_validate(dict(result._mapping))


async def sql_create_stage_item_with_inputs(
    tournament_id: TournamentId, stage_item: StageItemWithInputsCreate
) -> StageItem:
    async with database.transaction():
        stage_item_result = await sql_create_stage_item(
            tournament_id, StageItemCreateBody(**stage_item.model_dump())
        )

        for input_ in stage_item.inputs:
            await sql_create_stage_item_input(tournament_id, stage_item_result.id, input_)

    return stage_item_result


async def sql_create_stage_item_with_empty_inputs(
    tournament_id: TournamentId, stage_item: StageItemCreateBody
) -> StageItem:
    result = await sql_create_stage_item(tournament_id, stage_item)
    for i in range(stage_item.team_count):
        await sql_create_stage_item_input(
            tournament_id, result.id, StageItemInputCreateBodyEmpty(slot=i + 1)
        )

    return result


async def sql_delete_stage_item(stage_item_id: StageItemId) -> None:
    query = """
        DELETE FROM stage_items
        WHERE stage_items.id = :stage_item_id
        """
    await database.execute(query=query, values={"stage_item_id": stage_item_id})


async def get_stage_item(
    tournament_id: TournamentId, stage_item_id: StageItemId
) -> StageItemWithRounds:
    stages = await get_full_tournament_details(tournament_id, stage_item_ids={stage_item_id})
    if len(stages) < 1 or len(stages[0].stage_items) < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stage item doesn't exist",
        )

    return stages[0].stage_items[0]
