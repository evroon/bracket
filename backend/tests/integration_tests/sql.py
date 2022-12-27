from contextlib import asynccontextmanager
from typing import AsyncIterator

from pydantic import BaseModel

from bracket.database import database
from bracket.models.db.club import Club
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User, UserInDB
from bracket.schema import users, tournaments, clubs
from bracket.utils.db import fetch_one_parsed
from bracket.utils.dummy_records import DUMMY_TOURNAMENT, DUMMY_CLUB
from tests.integration_tests.mocks import MOCK_USER


@asynccontextmanager
async def inserted_user(user: User) -> AsyncIterator[UserInDB]:
    last_record_id = await database.execute(query=users.insert(), values=user.dict())
    user_inserted = await fetch_one_parsed(
        database, UserInDB, users.select().where(users.c.id == last_record_id)
    )
    assert user_inserted is not None
    try:
        yield user_inserted
    finally:
        await database.execute(query=users.delete().where(users.c.id == last_record_id))


@asynccontextmanager
async def inserted_club(club: Club) -> AsyncIterator[Club]:
    last_record_id = await database.execute(query=clubs.insert(), values=club.dict())
    user_inserted = await fetch_one_parsed(
        database, Club, clubs.select().where(clubs.c.id == last_record_id)
    )
    assert user_inserted is not None
    try:
        yield user_inserted
    finally:
        await database.execute(query=clubs.delete().where(clubs.c.id == last_record_id))


@asynccontextmanager
async def inserted_tournament(tournament: Tournament) -> AsyncIterator[Tournament]:
    last_record_id = await database.execute(query=tournaments.insert(), values=tournament.dict())
    user_inserted = await fetch_one_parsed(
        database, Tournament, tournaments.select().where(tournaments.c.id == last_record_id)
    )
    assert user_inserted is not None
    try:
        yield user_inserted
    finally:
        await database.execute(query=tournaments.delete().where(tournaments.c.id == last_record_id))


class AuthContext(BaseModel):
    club: Club
    tournament: Tournament
    user: User
    headers: dict[str, str]


@asynccontextmanager
async def inserted_auth_context() -> AsyncIterator[AuthContext]:
    token = (
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJ1c2VyIjoiZG9uYWxkX2R1Y2siLCJleHAiOjcyNTgxMjAyMDB9.'
        + 'CRk4n5gmgto5K-qWtI4hbcqo92BxLkggwwK1yTgWGLM'
    )
    headers = {'Authorization': f'Bearer {token}'}
    async with inserted_user(MOCK_USER) as user_inserted:
        async with inserted_club(DUMMY_CLUB) as club_inserted:
            async with inserted_tournament(DUMMY_TOURNAMENT) as tournament_inserted:
                yield AuthContext(
                    headers=headers,
                    user=user_inserted,
                    club=club_inserted,
                    tournament=tournament_inserted,
                )
