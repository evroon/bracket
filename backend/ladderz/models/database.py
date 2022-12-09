from datetime import datetime
from typing import Any

from heliclockter import datetime_utc
from pydantic import BaseModel


class UserBase(BaseModel):
    id: int | None = None
    username: str
    name: str
    created: datetime_utc

    class Config:
        orm_mode = True

    def dict(self, **kwargs: Any) -> Any:
        if 'exclude_none' in kwargs:
            del kwargs['exclude_none']

        result = super().dict(exclude_none=True, **kwargs)
        result['created'] = datetime.fromisoformat(self.created.isoformat())
        return result


class User(UserBase):
    password_hash: str | None = None


class UserPublic(UserBase):
    pass


class UserInDB(User):
    id: int
    password_hash: str
