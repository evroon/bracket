from bracket.sql.users import delete_user_and_owned_clubs
from bracket.utils.db_init import sql_create_dev_db


async def test_db_init() -> None:
    user_id = await sql_create_dev_db()
    await delete_user_and_owned_clubs(user_id)
