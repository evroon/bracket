from pydantic import BaseModel

from bracket.config import Environment, environment
from bracket.database import DatabasePool
from bracket.utils.conversion import to_string_mapping
from bracket.utils.logging import logger
from bracket.utils.types import assert_some


async def fetch_one_parsed[BaseModelT: BaseModel](
    database: DatabasePool, model: type[BaseModelT], query: str, values: dict | None = None
) -> BaseModelT | None:
    record = await database.fetch_one(query, values)
    return model.model_validate(dict(record)) if record is not None else None


async def fetch_one_parsed_certain[BaseModelT: BaseModel](
    database: DatabasePool, model: type[BaseModelT], query: str, values: dict | None = None
) -> BaseModelT:
    return assert_some(await fetch_one_parsed(database, model, query, values))


async def fetch_all_parsed[BaseModelT: BaseModel](
    database: DatabasePool, model: type[BaseModelT], query: str, values: dict | None = None
) -> list[BaseModelT]:
    records = await database.fetch_all(query, values)
    return [model.model_validate(dict(record)) for record in records]


async def insert_generic[BaseModelT: BaseModel](
    database: DatabasePool, data_model: BaseModelT, table_name: str, return_type: type[BaseModelT]
) -> tuple[int, BaseModelT]:
    assert environment is not Environment.PRODUCTION, "Below code can allow SQL injection"
    try:
        mapping = to_string_mapping(data_model)
        values = ", ".join([f":{key}" for key in mapping.keys()])
        query = (
            f"INSERT INTO {table_name} ({', '.join(mapping.keys())}) VALUES ({values}) RETURNING *"
        )
        result = await database.fetch_one(query, dict(mapping))
        assert result is not None, f"Could not insert {type(data_model).__name__}"
        last_record_id: int = result["id"]
        row_inserted = return_type.model_validate(dict(result))
        return last_record_id, row_inserted
    except Exception:
        logger.exception(f"Could not insert {type(data_model).__name__}")
        raise
