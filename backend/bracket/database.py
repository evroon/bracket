import sqlalchemy
from databases import Database

from bracket.config import Environment, config, environment
from bracket.schema import metadata
from bracket.utils.logging import logger

database = Database(config.pg_dsn)

engine = sqlalchemy.create_engine(config.pg_dsn)


async def init_db_when_empty() -> None:
    table_count = await database.fetch_val('SELECT count(*) FROM information_schema.tables')
    if table_count <= 1 and environment != Environment.CI:
        logger.warning('Empty db detected, creating tables...')
        metadata.create_all(engine)
