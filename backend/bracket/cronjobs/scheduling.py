import asyncio
from collections.abc import Awaitable, Callable

from heliclockter import timedelta

from bracket.models.db.account import UserAccountType
from bracket.sql.clubs import get_clubs_for_user_id, sql_delete_club
from bracket.sql.tournaments import sql_delete_tournament_completely, sql_get_tournaments
from bracket.sql.users import delete_user, get_expired_demo_users
from bracket.utils.asyncio import AsyncioTasksManager
from bracket.utils.logging import logger
from bracket.utils.types import assert_some

CronjobT = Callable[[], Awaitable[None]]


async def delete_demo_accounts() -> None:
    demo_users = await get_expired_demo_users()
    logger.info(f"Deleting {len(demo_users)} expired demo accounts")

    for demo_user in demo_users:
        assert demo_user.account_type is UserAccountType.DEMO
        user_id = assert_some(demo_user.id)

        for club in await get_clubs_for_user_id(user_id):
            club_id = assert_some(club.id)

            for tournament in await sql_get_tournaments((club_id,), None):
                tournament_id = assert_some(tournament.id)
                await sql_delete_tournament_completely(tournament_id)

            await sql_delete_club(club_id)

        await delete_user(user_id)


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
