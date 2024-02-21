#!/usr/bin/env python3
import asyncio
import functools
from typing import Any

import click
from heliclockter import datetime_utc

from bracket.config import config
from bracket.database import database
from bracket.logger import get_logger
from bracket.models.db.account import UserAccountType
from bracket.models.db.user import User
from bracket.sql.users import (
    check_whether_email_is_in_use,
    create_user,
)
from bracket.utils.db_init import sql_create_dev_db
from bracket.utils.security import hash_password
from bracket.utils.types import assert_some

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
def hash_password_cmd() -> None:
    if config.admin_password is None:
        logger.error("No admin password is given")
    else:
        hashed_pwd = hash_password(config.admin_password)
        logger.info("Hashed password:")
        logger.info(hashed_pwd)


@click.command()
@run_async
async def create_dev_db() -> None:
    await sql_create_dev_db()


@click.command()
@click.option("--email", prompt="Email", help="The email used to log into the account.")
@click.option("--password", prompt="Password", help="The password used to log into the account.")
@click.option("--name", prompt="Name", help="The name associated with the account.")
@run_async
async def register_user(email: str, password: str, name: str) -> None:
    user = User(
        email=email,
        password_hash=hash_password(password),
        name=name,
        created=datetime_utc.now(),
        account_type=UserAccountType.REGULAR,
    )
    if await check_whether_email_is_in_use(email):
        logger.error("Email address already in use")
        raise SystemExit(1)
    user_created = await create_user(user)
    assert_some(user_created.id)
    logger.info(f"Created user with id: {user_created.id}")


if __name__ == "__main__":
    cli.add_command(create_dev_db)
    cli.add_command(hash_password_cmd)
    cli.add_command(register_user)
    cli()
