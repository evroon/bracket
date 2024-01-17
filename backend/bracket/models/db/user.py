from heliclockter import datetime_utc
from pydantic import BaseModel, constr

from bracket.models.db.shared import BaseModelORM


class UserBase(BaseModelORM):
    id: int | None = None
    email: str
    name: str
    created: datetime_utc


class User(UserBase):
    password_hash: str | None = None


class UserPublic(UserBase):
    pass


class UserToUpdate(BaseModel):
    email: str
    name: str


class UserPasswordToUpdate(BaseModel):
    password: constr(min_length=8, max_length=48)  # type: ignore[valid-type]


class UserToRegister(BaseModelORM):
    email: str
    name: str
    password: str
    captcha_token: str


class UserInDB(User):
    id: int
    password_hash: str
