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
from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match
from bracket.models.db.player import Player
from bracket.models.db.round import Round
from bracket.models.db.stage import Stage
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User
from bracket.models.db.user_x_club import UserXClub
from bracket.schema import (
    clubs,
    courts,
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
from bracket.utils.db import insert_generic
from bracket.utils.dummy_records import (
    DUMMY_CLUB,
    DUMMY_COURT1,
    DUMMY_COURT2,
    DUMMY_MATCH1,
    DUMMY_MATCH2,
    DUMMY_MATCH3,
    DUMMY_MATCH4,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_PLAYER5,
    DUMMY_PLAYER6,
    DUMMY_PLAYER7,
    DUMMY_PLAYER8,
    DUMMY_PLAYER9,
    DUMMY_ROUND1,
    DUMMY_ROUND2,
    DUMMY_ROUND3,
    DUMMY_STAGE1,
    DUMMY_STAGE2,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
    DUMMY_TEAM3,
    DUMMY_TEAM4,
    DUMMY_TOURNAMENT,
    DUMMY_USER,
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


@click.command()
@run_async
async def create_dev_db() -> None:
    assert environment is Environment.DEVELOPMENT

    logger.warning('Initializing database with dummy records')
    await database.connect()
    metadata.drop_all(engine)
    real_user_id = await init_db_when_empty()

    table_lookup: dict[type, Table] = {
        User: users,
        Club: clubs,
        Stage: stages,
        Team: teams,
        UserXClub: users_x_clubs,
        Player: players,
        Round: rounds,
        Match: matches,
        Tournament: tournaments,
        Court: courts,
    }

    async def insert_dummy(obj_to_insert: BaseModelT) -> int:
        record_id, _ = await insert_generic(
            database, obj_to_insert, table_lookup[type(obj_to_insert)], type(obj_to_insert)
        )
        return record_id

    user_id_1 = await insert_dummy(DUMMY_USER)
    club_id_1 = await insert_dummy(DUMMY_CLUB)
    await insert_dummy(UserXClub(user_id=user_id_1, club_id=club_id_1))

    if real_user_id is not None:
        await insert_dummy(UserXClub(user_id=real_user_id, club_id=club_id_1))

    tournament_id_1 = await insert_dummy(DUMMY_TOURNAMENT.copy(update={'club_id': club_id_1}))
    stage_id_1 = await insert_dummy(DUMMY_STAGE1.copy(update={'tournament_id': tournament_id_1}))
    stage_id_2 = await insert_dummy(DUMMY_STAGE2.copy(update={'tournament_id': tournament_id_1}))
    team_id_1 = await insert_dummy(DUMMY_TEAM1.copy(update={'tournament_id': tournament_id_1}))
    team_id_2 = await insert_dummy(DUMMY_TEAM2.copy(update={'tournament_id': tournament_id_1}))
    team_id_3 = await insert_dummy(DUMMY_TEAM3.copy(update={'tournament_id': tournament_id_1}))
    team_id_4 = await insert_dummy(DUMMY_TEAM4.copy(update={'tournament_id': tournament_id_1}))

    await insert_dummy(DUMMY_PLAYER1.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER2.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER3.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER4.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER5.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER6.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER7.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER8.copy(update={'tournament_id': tournament_id_1}))
    await insert_dummy(DUMMY_PLAYER9.copy(update={'tournament_id': tournament_id_1}))

    round_id_1 = await insert_dummy(DUMMY_ROUND1.copy(update={'stage_id': stage_id_1}))
    round_id_2 = await insert_dummy(DUMMY_ROUND2.copy(update={'stage_id': stage_id_1}))
    round_id_3 = await insert_dummy(DUMMY_ROUND3.copy(update={'stage_id': stage_id_2}))

    court_id_1 = await insert_dummy(DUMMY_COURT1.copy(update={'tournament_id': tournament_id_1}))
    court_id_2 = await insert_dummy(DUMMY_COURT2.copy(update={'tournament_id': tournament_id_1}))

    await insert_dummy(
        DUMMY_MATCH1.copy(
            update={
                'round_id': round_id_1,
                'team1_id': team_id_1,
                'team2_id': team_id_2,
                'court_id': court_id_1,
            }
        ),
    )
    await insert_dummy(
        DUMMY_MATCH2.copy(
            update={
                'round_id': round_id_1,
                'team1_id': team_id_3,
                'team2_id': team_id_4,
                'court_id': court_id_2,
            }
        ),
    )
    await insert_dummy(
        DUMMY_MATCH3.copy(
            update={'round_id': round_id_2, 'team1_id': team_id_2, 'team2_id': team_id_4}
        ),
    )
    await insert_dummy(
        DUMMY_MATCH4.copy(
            update={'round_id': round_id_3, 'team1_id': team_id_3, 'team2_id': team_id_1}
        ),
    )

    for tournament in await database.fetch_all(tournaments.select()):
        await recalculate_elo_for_tournament_id(tournament.id)  # type: ignore[attr-defined]


if __name__ == "__main__":
    cli.add_command(create_dev_db)
    cli()
