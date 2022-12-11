import asyncio
import functools
from typing import Any

import click

from ladderz.database import database, engine
from ladderz.logger import get_logger
from ladderz.schema import metadata, players, tournaments, users
from ladderz.utils.dummy_records import DUMMY_PLAYER, DUMMY_TOURNAMENT, DUMMY_USER

logger = get_logger('cli')


def run_async(f: Any) -> Any:
    @functools.wraps(f)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        loop = asyncio.new_event_loop()

        async def inner() -> None:
            try:
                await database.connect()
                await f(*args, **kwargs)

            except KeyboardInterrupt:
                logger.debug('Closing the process.')
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
@run_async
async def create_dev_db() -> None:
    logger.warning('Initializing database with dummy records')
    await database.connect()
    metadata.create_all(engine)
    await database.execute(query=users.insert(), values=DUMMY_USER.dict())
    await database.execute(query=tournaments.insert(), values=DUMMY_TOURNAMENT.dict())
    await database.execute(query=players.insert(), values=DUMMY_PLAYER.dict())


if __name__ == "__main__":
    cli.add_command(create_dev_db)
    cli()
