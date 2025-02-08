import pytest

from bracket.sql.users import delete_user_and_owned_clubs
from bracket.utils.db_init import sql_create_dev_db


@pytest.mark.asyncio(loop_scope="session")
async def test_db_init() -> None:
    user_id = await sql_create_dev_db()
    await delete_user_and_owned_clubs(user_id)
