from contextlib import asynccontextmanager
from typing import AsyncIterator, Type, cast

from sqlalchemy import Table

from bracket.database import database
from bracket.models.db.club import Club
from bracket.models.db.match import Match
from bracket.models.db.player import Player
from bracket.models.db.round import Round
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User, UserInDB
from bracket.schema import clubs, teams, tournaments, users, players, rounds, matches
from bracket.utils.db import fetch_one_parsed
from bracket.utils.dummy_records import DUMMY_CLUB, DUMMY_TOURNAMENT
from bracket.utils.types import BaseModelT
from tests.integration_tests.mocks import MOCK_USER, get_mock_token
from tests.integration_tests.models import AuthContext


@asynccontextmanager
async def inserted_generic(
    data_model: BaseModelT, table: Table, return_type: Type[BaseModelT]
) -> AsyncIterator[BaseModelT]:
    last_record_id = await database.execute(query=table.insert(), values=data_model.dict())
    row_inserted = await fetch_one_parsed(
        database, return_type, table.select().where(table.c.id == last_record_id)
    )
    assert isinstance(row_inserted, return_type)
    try:
        yield row_inserted
    finally:
        await database.execute(query=table.delete().where(table.c.id == last_record_id))


@asynccontextmanager
async def inserted_user(user: User) -> AsyncIterator[UserInDB]:
    async with inserted_generic(user, users, UserInDB) as row_inserted:
        yield cast(UserInDB, row_inserted)


@asynccontextmanager
async def inserted_club(club: Club) -> AsyncIterator[Club]:
    async with inserted_generic(club, clubs, Club) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_tournament(tournament: Tournament) -> AsyncIterator[Tournament]:
    async with inserted_generic(tournament, tournaments, Tournament) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_team(team: Team) -> AsyncIterator[Team]:
    async with inserted_generic(team, teams, Team) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_player(player: Player) -> AsyncIterator[Player]:
    async with inserted_generic(player, players, Player) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_round(round: Round) -> AsyncIterator[Round]:
    async with inserted_generic(round, rounds, Round) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_match(match: Match) -> AsyncIterator[Match]:
    async with inserted_generic(match, matches, Match) as row_inserted:
        yield row_inserted


@asynccontextmanager
async def inserted_auth_context() -> AsyncIterator[AuthContext]:
    headers = {'Authorization': f'Bearer {get_mock_token()}'}
    async with inserted_user(MOCK_USER) as user_inserted:
        async with inserted_club(DUMMY_CLUB) as club_inserted:
            async with inserted_tournament(DUMMY_TOURNAMENT) as tournament_inserted:
                yield AuthContext(
                    headers=headers,
                    user=user_inserted,
                    club=club_inserted,
                    tournament=tournament_inserted,
                )
