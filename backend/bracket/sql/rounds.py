from bracket.database import database
from bracket.models.db.util import RoundWithMatches
from bracket.sql.stage_items import get_stage_item
from bracket.sql.stages import get_full_tournament_details


async def get_rounds_for_stage_item(
    tournament_id: int, stage_item_id: int
) -> list[RoundWithMatches]:
    stage_item = await get_stage_item(tournament_id, stage_item_id)

    if stage_item is None:
        raise ValueError(
            f'Could not find stage item with id {stage_item_id} for tournament {tournament_id}'
        )

    return stage_item.rounds


async def get_round_by_id(tournament_id: int, round_id: int) -> RoundWithMatches | None:
    stages = await get_full_tournament_details(
        tournament_id, no_draft_rounds=False, round_id=round_id
    )

    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                if round_ is not None:
                    return round_

    return None


async def get_next_round_name(tournament_id: int, stage_item_id: int) -> str:
    query = '''
        SELECT count(*) FROM rounds
        JOIN stage_items on stage_items.id = rounds.stage_item_id
        JOIN stages on stage_items.stage_id = stages.id
        WHERE stages.tournament_id = :tournament_id
        AND rounds.stage_item_id = :stage_item_id
    '''
    round_count = int(
        await database.fetch_val(
            query=query, values={'tournament_id': tournament_id, 'stage_item_id': stage_item_id}
        )
    )
    return f'Round {round_count + 1}'


async def sql_delete_rounds_for_stage_item_id(stage_item_id: int) -> None:
    query = '''
        DELETE FROM rounds
        WHERE rounds.stage_item_id = :stage_item_id
        '''
    await database.execute(query=query, values={'stage_item_id': stage_item_id})
