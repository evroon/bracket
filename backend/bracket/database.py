import sqlalchemy
from databases import Database
from heliclockter import datetime_utc

from bracket.config import Environment, config, environment
from bracket.models.db.user import User
from bracket.schema import metadata, users
from bracket.utils.logging import logger
from bracket.utils.security import pwd_context

database = Database(config.pg_dsn)

engine = sqlalchemy.create_engine(config.pg_dsn)


async def init_db_when_empty() -> None:
    table_count = await database.fetch_val(
        'SELECT count(*) FROM information_schema.tables WHERE table_schema = \'public\''
    )
    if (
        table_count <= 1
        and environment != Environment.CI
        and config.admin_email
        and config.admin_password
    ):
        logger.warning('Empty db detected, creating tables...')
        metadata.create_all(engine)

        logger.warning('Empty db detected, creating admin user...')
        admin = User(
            name='Admin',
            email=config.admin_email,
            password_hash=pwd_context.hash(config.admin_password),
            created=datetime_utc.now(),
        )
        await database.execute(query=users.insert(), values=admin.dict())
