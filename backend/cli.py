#!/usr/bin/env python3
import asyncio
import functools
from typing import Any

import click
from sqlalchemy import Table

from bracket.config import Environment, environment
from bracket.database import database, engine, init_db_when_empty
from bracket.logger import get_logger
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.schema import (
    clubs,
    matches,
    metadata,
    players,
    rounds,
    stages,
    teams,
    tournaments,
    users,
    users_x_clubs,
)
from bracket.utils.conversion import to_string_mapping
from bracket.utils.dummy_records import (
    DUMMY_CLUBS,
    DUMMY_MATCHES,
    DUMMY_PLAYERS,
    DUMMY_ROUNDS,
    DUMMY_STAGES,
    DUMMY_TEAMS,
    DUMMY_TOURNAMENTS,
    DUMMY_USERS,
    DUMMY_USERS_X_CLUBS,
)
from bracket.utils.types import BaseModelT

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


async def bulk_insert(table: Table, rows: list[BaseModelT]) -> None:
    for row in rows:
        await database.execute(query=table.insert(), values=to_string_mapping(row))  # type: ignore[arg-type]


@click.command()
@run_async
async def create_dev_db() -> None:
    assert environment is Environment.DEVELOPMENT

    logger.warning('Initializing database with dummy records')
    await database.connect()
    metadata.drop_all(engine)
    await init_db_when_empty()

    await bulk_insert(users, DUMMY_USERS)
    await bulk_insert(clubs, DUMMY_CLUBS)
    await bulk_insert(tournaments, DUMMY_TOURNAMENTS)
    await bulk_insert(stages, DUMMY_STAGES)
    await bulk_insert(teams, DUMMY_TEAMS)
    await bulk_insert(players, DUMMY_PLAYERS)
    await bulk_insert(rounds, DUMMY_ROUNDS)
    await bulk_insert(matches, DUMMY_MATCHES)
    await bulk_insert(users_x_clubs, DUMMY_USERS_X_CLUBS)

    for tournament in await database.fetch_all(tournaments.select()):
        await recalculate_elo_for_tournament_id(tournament.id)  # type: ignore[attr-defined]


if __name__ == "__main__":
    cli.add_command(create_dev_db)
    cli()
