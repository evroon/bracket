import asyncio
from collections.abc import Awaitable, Callable
from datetime import datetime, timezone

from heliclockter import timedelta

from bracket.models.db.account import UserAccountType
from bracket.sql.matches import (
    sql_get_matches_needing_notification,
    sql_mark_match_players_notified,
)
from bracket.sql.users import delete_user_and_owned_clubs, get_expired_demo_users
from bracket.utils.asyncio import AsyncioTasksManager
from bracket.utils.email import is_email_configured, send_email
from bracket.utils.logging import logger

CronjobT = Callable[[], Awaitable[None]]

NOTIFY_MINUTES_BEFORE_MATCH = 15


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
    if not is_email_configured():
        return

    rows = await sql_get_matches_needing_notification(minutes_ahead=NOTIFY_MINUTES_BEFORE_MATCH)
    if len(rows) < 1:
        return

    logger.info(f"Sending match-starting-soon notifications to {len(rows)} players")

    now = datetime.now(timezone.utc)
    emails_sent_per_match: dict[int, int] = {}

    for row in rows:
        start_time = row["start_time"].astimezone(timezone.utc)
        minutes_left = max(1, round((start_time - now).total_seconds() / 60))

        subject = "Your match starts soon"
        body = (
            f"Hi {row['player_name']},\n\n"
            f"Your match starts in about {minutes_left} minutes, "
            f"at {start_time.strftime('%Y-%m-%d %H:%M')} UTC. "
            f"Please make sure you're ready in time.\n\n"
            f"Good luck!"
        )

        was_sent = await send_email(row["player_email"], subject, body)
        match_id = row["match_id"]
        emails_sent_per_match[match_id] = emails_sent_per_match.get(match_id, 0) + int(was_sent)

    # Only mark a match as notified when at least one email went out, so a broken SMTP
    # connection leads to a retry on the next run instead of silently losing the notification.
    for match_id, emails_sent in emails_sent_per_match.items():
        if emails_sent > 0:
            await sql_mark_match_players_notified(match_id)
        else:
            logger.warning(f"Could not notify any player of match {match_id}, will retry")


async def run_cronjob(cronjob_entrypoint: CronjobT, delta_time: timedelta) -> None:
    while True:
        await asyncio.sleep(delta_time.total_seconds())

        try:
            await cronjob_entrypoint()
        except Exception as e:
            logger.exception(f"Could not run cronjob {cronjob_entrypoint.__name__}: {e}")


CRONJOBS = (
    (timedelta(minutes=5), delete_demo_accounts),
    (timedelta(minutes=1), notify_players_of_upcoming_matches),
)


def start_cronjobs() -> None:
    for delta_time, cronjob_entrypoint in CRONJOBS:
        AsyncioTasksManager.add_coroutine(run_cronjob(cronjob_entrypoint, delta_time))