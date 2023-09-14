from bracket.database import database
from bracket.models.db.stage_item_inputs import (
    StageItemInputBase,
    StageItemInputCreateBody,
    StageItemInputCreateBodyFinal,
    StageItemInputCreateBodyTentative,
)


async def sql_delete_stage_item_inputs(stage_item_id: int) -> None:
    query = '''
        DELETE FROM stage_item_inputs
        WHERE stage_item_id = :stage_item_id OR team_stage_item_id = :stage_item_id
        '''
    await database.execute(query=query, values={'stage_item_id': stage_item_id})


async def sql_create_stage_item_input(
    tournament_id: int, stage_item_id: int, stage_item_input: StageItemInputCreateBody
) -> StageItemInputBase:
    async with database.transaction():
        query = '''
            INSERT INTO stage_item_inputs
            (
                slot,
                tournament_id,
                stage_item_id,
                team_id,
                team_stage_item_id,
                team_position_in_group
            )
            VALUES
            (
                :slot,
                :tournament_id,
                :stage_item_id,
                :team_id,
                :team_stage_item_id,
                :team_position_in_group
            )
            RETURNING *
            '''
        result = await database.fetch_one(
            query=query,
            values={
                'slot': stage_item_input.slot,
                'tournament_id': tournament_id,
                'stage_item_id': stage_item_id,
                'team_id': stage_item_input.team_id
                if isinstance(stage_item_input, StageItemInputCreateBodyFinal)
                else None,
                'team_stage_item_id': stage_item_input.team_stage_item_id
                if isinstance(stage_item_input, StageItemInputCreateBodyTentative)
                else None,
                'team_position_in_group': stage_item_input.team_position_in_group
                if isinstance(stage_item_input, StageItemInputCreateBodyTentative)
                else None,
            },
        )

    if result is None:
        raise ValueError('Could not create stage')

    return StageItemInputBase.parse_obj(result._mapping)
