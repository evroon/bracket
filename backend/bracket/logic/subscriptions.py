from __future__ import annotations

from typing import TYPE_CHECKING, Any

from fastapi import HTTPException
from pydantic import BaseModel

from bracket.models.db.account import UserAccountType

if TYPE_CHECKING:
    from bracket.models.db.user import UserBase


class Subscription(BaseModel):
    max_teams: int
    max_players: int
    max_clubs: int
    max_tournaments: int
    max_courts: int
    max_stages: int
    max_stage_items: int
    max_rounds: int


demo_subscription = Subscription(
    max_teams=8,
    max_players=16,
    max_clubs=1,
    max_tournaments=2,
    max_courts=4,
    max_stages=4,
    max_stage_items=6,
    max_rounds=6,
)


regular_subscription = Subscription(
    max_teams=128,
    max_players=256,
    max_clubs=32,
    max_tournaments=64,
    max_courts=32,
    max_stages=16,
    max_stage_items=64,
    max_rounds=64,
)

subscription_lookup = {
    UserAccountType.DEMO: demo_subscription,
    UserAccountType.REGULAR: regular_subscription,
}


def check_requirement(array: list[Any], user: UserBase, attribute: str, additions: int = 1) -> None:
    subscription = subscription_lookup[user.account_type]
    constraint: int = getattr(subscription, attribute)
    if len(array) + additions > constraint:
        raise HTTPException(
            400,
            f'Your `{user.account_type.value}` subscription allows a maximum of '
            f'{constraint} {attribute.replace("max_", "")}.',
        )
