from typing import Any

import sqlalchemy
from databases import Database
from heliclockter import datetime_utc

from bracket.config import config


def datetime_decoder(value: str) -> datetime_utc:
    value = value.split(".")[0].replace("+00", "+00:00")
    return datetime_utc.fromisoformat(value)


async def asyncpg_init(connection: Any) -> None:
    for timestamp_type in ("timestamp", "timestamptz"):
        await connection.set_type_codec(
            timestamp_type,
            encoder=datetime_utc.isoformat,
            decoder=datetime_decoder,
            schema="pg_catalog",
        )


database = Database(str(config.pg_dsn), init=asyncpg_init)

engine = sqlalchemy.create_engine(str(config.pg_dsn))
