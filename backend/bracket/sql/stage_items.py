from bracket.database import database
from bracket.models.db.stage_item import StageItem, StageItemCreateBody
from bracket.models.db.util import StageItemWithRounds
from bracket.sql.stage_item_inputs import sql_create_stage_item_input
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import StageItemId, TournamentId


async def sql_create_stage_item(
    tournament_id: TournamentId, stage_item: StageItemCreateBody
) -> StageItem:
    async with database.transaction():
        query = """
            INSERT INTO stage_items (type, stage_id, name, team_count)
            VALUES (:stage_item_type, :stage_id, :name, :team_count)
            RETURNING *
            """
        result = await database.fetch_one(
            query=query,
            values={
                "stage_item_type": stage_item.type.value,
                "stage_id": stage_item.stage_id,
                "name": stage_item.get_name_or_default_name(),
                "team_count": stage_item.team_count,
            },
        )

        if result is None:
            raise ValueError("Could not create stage")

        stage_item_result = StageItem.model_validate(dict(result._mapping))

        for input_ in stage_item.inputs:
            await sql_create_stage_item_input(tournament_id, stage_item_result.id, input_)

    return stage_item_result


async def sql_delete_stage_item(stage_item_id: StageItemId) -> None:
    query = """
        DELETE FROM stage_items
        WHERE stage_items.id = :stage_item_id
        """
    await database.execute(query=query, values={"stage_item_id": stage_item_id})


async def get_stage_item(
    tournament_id: TournamentId, stage_item_id: StageItemId
) -> StageItemWithRounds | None:
    stages = await get_full_tournament_details(tournament_id, stage_item_ids={stage_item_id})
    if len(stages) < 1 or len(stages[0].stage_items) < 1:
        return None

    return stages[0].stage_items[0]
