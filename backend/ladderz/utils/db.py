from typing import Type

from databases import Database
from sqlalchemy.sql import Select

from ladderz.utils.types import BaseModelT


async def fetch_one_parsed(
    database: Database, model: Type[BaseModelT], query: Select
) -> BaseModelT | None:
    record = await database.fetch_one(query)
    return model.parse_obj(record._mapping) if record is not None else None


async def fetch_all_parsed(
    database: Database, model: Type[BaseModelT], query: Select
) -> list[BaseModelT]:
    records = await database.fetch_all(query)
    return [model.parse_obj(record._mapping) for record in records]


async def get_next_round_name(database: Database, tournament_id: int) -> str:
    query = '''
        SELECT count(*) FROM rounds
        WHERE rounds.tournament_id = :tournament_id
    '''
    round_count = int(
        await database.fetch_val(query=query, values={'tournament_id': tournament_id})
    )
    return f'Round {round_count + 1}'
