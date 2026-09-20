import asyncio
from collections.abc import Awaitable, Callable

from heliclockter import timedelta

from bracket.models.db.account import UserAccountType
from bracket.sql.matches import (
    sql_get_matches_needing_notification,
    sql_mark_match_players_notified,
)
from bracket.sql.users import delete_user_and_owned_clubs, get_expired_demo_users
from bracket.utils.asyncio import AsyncioTasksManager
from bracket.utils.email import send_email
from bracket.utils.logging import logger

CronjobT = Callable[[], Awaitable[None]]


async def delete_demo_accounts() -> None:
    demo_users = await get_expired_demo_users()
    if len(demo_users) < 1:
        return

    logger.info(f"Deleting {len(demo_users)} expired demo accounts")

    for demo_user in demo_users:
        assert demo_user.account_type is UserAccountType.DEMO
        user_id = demo_user.id

        await delete_user_and_owned_clubs(user_id)


async def notify_players_of_upcoming_matches() -> None:
    rows = await sql_get_matches_needing_notification(minutes_ahead=15)
    if len(rows) < 1:
        return

    logger.info(f"Sending {len(rows)} match-starting-soon notifications")

    notified_match_ids: set[int] = set()

    for row in rows:
        start_time_str = row["start_time"].strftime("%H:%M")
        subject = "Your match starts soon"
        body = (
            f"Hi {row['player_name']},\n\n"
            f"Your match is scheduled to start at {start_time_str}. "
            f"Please make sure you're ready in time.\n\n"
            f"Good luck!"
        )
        await send_email(row["player_email"], subject, body)
        notified_match_ids.add(row["match_id"])

    for match_id in notified_match_ids:
        await sql_mark_match_players_notified(match_id)


async def run_cronjob(cronjob_entrypoint: CronjobT, delta_time: timedelta) -> None:
    while True:
        await asyncio.sleep(delta_time.total_seconds())

        try:
            await cronjob_entrypoint()
        except Exception as e:
            logger.exception(f"Could not run cronjob {cronjob_entrypoint.__name__}: {e}")


CRONJOBS = (
    (timedelta(minutes=5), delete_demo_accounts),
    (timedelta(minutes=5), notify_players_of_upcoming_matches),
)


def start_cronjobs() -> None:
    for delta_time, cronjob_entrypoint in CRONJOBS:
        AsyncioTasksManager.add_coroutine(run_cronjob(cronjob_entrypoint, delta_time))
