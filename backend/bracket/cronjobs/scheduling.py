import asyncio
from collections.abc import Awaitable, Callable

from heliclockter import timedelta

from bracket.models.db.account import UserAccountType
from bracket.sql.users import delete_user_and_owned_clubs, get_expired_demo_users
from bracket.utils.asyncio import AsyncioTasksManager
from bracket.utils.logging import logger
from bracket.utils.types import assert_some

CronjobT = Callable[[], Awaitable[None]]


async def delete_demo_accounts() -> None:
    demo_users = await get_expired_demo_users()
    if len(demo_users) < 1:
        return

    logger.info(f"Deleting {len(demo_users)} expired demo accounts")

    for demo_user in demo_users:
        assert demo_user.account_type is UserAccountType.DEMO
        user_id = assert_some(demo_user.id)

        await delete_user_and_owned_clubs(user_id)


async def run_cronjob(cronjob_entrypoint: CronjobT, delta_time: timedelta) -> None:
    while True:
        await asyncio.sleep(delta_time.total_seconds())

        try:
            await cronjob_entrypoint()
        except Exception as e:
            logger.exception(f"Could not run cronjob {cronjob_entrypoint.__name__}: {e}")


CRONJOBS = ((timedelta(minutes=5), delete_demo_accounts),)


def start_cronjobs() -> None:
    for delta_time, cronjob_entrypoint in CRONJOBS:
        AsyncioTasksManager.add_coroutine(run_cronjob(cronjob_entrypoint, delta_time))
