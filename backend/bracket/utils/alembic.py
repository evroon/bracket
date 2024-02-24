from bracket.utils.logging import logger

from alembic import command
from alembic.config import Config


def get_alembic_config() -> None:
    return Config("alembic.ini")


def alembic_run_migrations() -> None:
    logger.info("Running migrations")
    command.upgrade(Config("alembic.ini"), "head")


def alembic_stamp_head() -> None:
    logger.info("Overwriting current version to be the latest revision (head)")
    command.stamp(Config("alembic.ini"), "head")