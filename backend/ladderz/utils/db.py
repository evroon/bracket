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


async def get_max_round_id(database: Database, tournament_id: int) -> int:
    query = '''
        SELECT max(round_id) FROM rounds
        WHERE rounds.tournament_id = :tournament_id
        GROUP BY rounds.id
    '''
    return int(await database.fetch_val(query=query, values={'tournament_id': tournament_id}))
