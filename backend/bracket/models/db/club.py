from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Club(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc


class ClubCreateBody(BaseModelORM):
    name: str


class ClubUpdateBody(BaseModelORM):
    name: str
