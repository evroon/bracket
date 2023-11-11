from bracket.database import database
from bracket.sql.stage_items import sql_delete_stage_item


async def sql_delete_stage_item_with_foreign_keys(stage_item_id: int) -> None:
    from bracket.sql.matches import sql_delete_matches_for_stage_item_id
    from bracket.sql.rounds import sql_delete_rounds_for_stage_item_id
    from bracket.sql.stage_item_inputs import sql_delete_stage_item_inputs

    async with database.transaction():
        await sql_delete_matches_for_stage_item_id(stage_item_id)
        await sql_delete_rounds_for_stage_item_id(stage_item_id)
        await sql_delete_stage_item_inputs(stage_item_id)
        await sql_delete_stage_item(stage_item_id)
