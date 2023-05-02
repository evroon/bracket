from typing import List

from bracket.database import database
from bracket.models.db.round import RoundWithMatches
from bracket.sql.stages import get_stages_with_rounds_and_matches


async def get_rounds_for_stage(tournament_id: int, stage_id: int) -> List[RoundWithMatches]:
    stages = await get_stages_with_rounds_and_matches(tournament_id)
    result_stage = next((stage for stage in stages if stage.id == stage_id), None)
    if result_stage is None:
        raise ValueError(f'Could not find stage with id {stage_id} for tournament {tournament_id}')

    return result_stage.rounds


async def get_next_round_name(tournament_id: int, stage_id: int) -> str:
    query = '''
        SELECT count(*) FROM rounds
        JOIN stages s on s.id = rounds.stage_id
        WHERE s.tournament_id = :tournament_id
        AND rounds.stage_id = :stage_id
    '''
    round_count = int(
        await database.fetch_val(
            query=query, values={'tournament_id': tournament_id, 'stage_id': stage_id}
        )
    )
    return f'Round {round_count + 1}'
