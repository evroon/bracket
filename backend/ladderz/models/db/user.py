from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class UserBase(BaseModelORM):
    id: int | None = None
    email: str
    name: str
    created: datetime_utc


class User(UserBase):
    password_hash: str | None = None


class UserPublic(UserBase):
    pass


class UserInDB(User):
    id: int
    password_hash: str
