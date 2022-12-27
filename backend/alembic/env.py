import logging
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import engine_from_config, pool

from alembic import context

parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from bracket.schema import Base  # pylint: disable=wrong-import-position

load_dotenv()

ALEMBIC_CONFIG = context.config
logger = logging.getLogger('alembic')


def run_migrations_offline() -> None:
    url = ALEMBIC_CONFIG.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=Base.metadata, compare_type=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    config_ini_section = ALEMBIC_CONFIG.get_section(ALEMBIC_CONFIG.config_ini_section)
    config_ini_section['sqlalchemy.url'] = str(os.getenv('pg_dsn'))  # type: ignore[index]

    engine = engine_from_config(config_ini_section, prefix='sqlalchemy.', poolclass=pool.NullPool)

    connection = engine.connect()
    context.configure(connection=connection, target_metadata=Base.metadata, compare_type=True)

    try:
        with context.begin_transaction():
            context.run_migrations()
    finally:
        connection.close()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
