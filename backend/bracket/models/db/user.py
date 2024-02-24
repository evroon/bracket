from __future__ import annotations

from typing import TYPE_CHECKING

from heliclockter import datetime_utc
from pydantic import BaseModel, constr

from bracket.models.db.account import UserAccountType
from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import UserId

if TYPE_CHECKING:
    from bracket.logic.subscriptions import Subscription


class UserBase(BaseModelORM):
    id: UserId | None = None
    email: str
    name: str
    created: datetime_utc
    account_type: UserAccountType

    @property
    def subscription(self) -> Subscription:
        from bracket.logic.subscriptions import subscription_lookup

        return subscription_lookup[self.account_type]


class User(UserBase):
    password_hash: str | None = None


class UserPublic(UserBase):
    pass


class UserToUpdate(BaseModel):
    email: str
    name: str


class UserPasswordToUpdate(BaseModel):
    password: constr(min_length=8, max_length=48)  # type: ignore[valid-type]


class DemoUserToRegister(BaseModelORM):
    captcha_token: str


class UserToRegister(BaseModelORM):
    email: str
    name: str
    password: str
    captcha_token: str


class UserInDB(User):
    id: UserId
    password_hash: str
