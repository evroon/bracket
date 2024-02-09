from bracket.cronjobs.scheduling import delete_demo_accounts
from bracket.models.db.account import UserAccountType
from bracket.sql.users import update_user, update_user_account_type, get_user_by_id
from tests.integration_tests.models import AuthContext


async def test_delete_demo_accounts(auth_context: AuthContext) -> None:
    user_id = auth_context.user.id
    await update_user_account_type(user_id, UserAccountType.DEMO)

    assert await get_user_by_id(user_id) is not None
    await delete_demo_accounts()
    assert await get_user_by_id(user_id) is None
