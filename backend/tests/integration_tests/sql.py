from contextlib import asynccontextmanager
from typing import AsyncIterator

from bracket.database import database
from bracket.models.db.user import User, UserInDB
from bracket.schema import users
from bracket.utils.db import fetch_one_parsed


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
