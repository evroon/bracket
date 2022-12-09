from typing import Type

from databases import Database
from sqlalchemy.sql import Select

from ladderz.utils.types import BaseModelT


async def fetch_one_parsed(
    database: Database, model: Type[BaseModelT], query: Select
) -> BaseModelT | None:
    record = await database.fetch_one(query)
    return model.parse_obj(record._mapping) if record is not None else None
