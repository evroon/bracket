from typing import Any

import sqlalchemy
from databases import Database
from heliclockter import datetime_utc

from bracket.config import config


async def asyncpg_init(connection: Any) -> None:
    for timestamp_type in ("timestamp", "timestamptz"):
        await connection.set_type_codec(
            timestamp_type,
            encoder=datetime_utc.isoformat,
            decoder=datetime_utc.fromisoformat,
            schema="pg_catalog",
        )

database = Database(str(config.pg_dsn), init=asyncpg_init)

engine = sqlalchemy.create_engine(str(config.pg_dsn))
