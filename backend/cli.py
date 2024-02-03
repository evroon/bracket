#!/usr/bin/env python3
import asyncio
import functools
from typing import Any

import click

from bracket.config import config
from bracket.database import database
from bracket.logger import get_logger
from bracket.utils.db_init import sql_create_dev_db
from bracket.utils.security import pwd_context

logger = get_logger("cli")


def run_async(f: Any) -> Any:
    @functools.wraps(f)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        loop = asyncio.new_event_loop()

        async def inner() -> None:
            try:
                await database.connect()
                await f(*args, **kwargs)

            except KeyboardInterrupt:
                logger.debug("Closing the process.")
            except Exception as e:
                logger.error(e, exc_info=True)
                raise e
            finally:
                await database.disconnect()

        return loop.run_until_complete(inner())

    return wrapper


@click.group()
def cli() -> None:
    pass


@click.command()
def hash_password() -> None:
    if config.admin_password is None:
        logger.error("No admin password is given")
    else:
        hashed_pwd = pwd_context.hash(config.admin_password)
        logger.info("Hashed password:")
        logger.info(hashed_pwd)


@click.command()
@run_async
async def create_dev_db() -> None:
    await sql_create_dev_db()


if __name__ == "__main__":
    cli.add_command(create_dev_db)
    cli.add_command(hash_password)
    cli()
