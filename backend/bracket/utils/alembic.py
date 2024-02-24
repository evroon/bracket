from alembic import command
from alembic.config import Config
from bracket.utils.logging import logger


def get_alembic_config() -> Config:
    return Config("alembic.ini")


def alembic_run_migrations() -> None:
    logger.info("Running migrations")
    command.upgrade(get_alembic_config(), "head")


def alembic_stamp_head() -> None:
    logger.info("Overwriting current version to be the latest revision (head)")
    command.stamp(get_alembic_config(), "head")
