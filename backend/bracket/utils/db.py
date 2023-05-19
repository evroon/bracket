from typing import Type

from databases import Database
from sqlalchemy import Table
from sqlalchemy.sql import Select

from bracket.utils.conversion import to_string_mapping
from bracket.utils.logging import logger
from bracket.utils.types import BaseModelT, assert_some


async def fetch_one_parsed(
    database: Database, model: Type[BaseModelT], query: Select
) -> BaseModelT | None:
    record = await database.fetch_one(query)
    return model.parse_obj(record._mapping) if record is not None else None


async def fetch_one_parsed_certain(
    database: Database, model: Type[BaseModelT], query: Select
) -> BaseModelT:
    return assert_some(await fetch_one_parsed(database, model, query))


async def fetch_all_parsed(
    database: Database, model: Type[BaseModelT], query: Select
) -> list[BaseModelT]:
    records = await database.fetch_all(query)
    return [model.parse_obj(record._mapping) for record in records]


async def insert_generic(
    database: Database, data_model: BaseModelT, table: Table, return_type: Type[BaseModelT]
) -> tuple[int, BaseModelT]:
    try:
        last_record_id: int = await database.execute(
            query=table.insert(), values=to_string_mapping(data_model)  # type: ignore[arg-type]
        )
        row_inserted = await fetch_one_parsed(
            database, return_type, table.select().where(table.c.id == last_record_id)
        )
        assert isinstance(row_inserted, return_type)
        return last_record_id, row_inserted
    except Exception:
        logger.exception(f'Could not insert {type(data_model).__name__}')
        raise
