from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import ClubId


class Club(BaseModelORM):
    id: ClubId | None = None
    name: str
    created: datetime_utc


class ClubCreateBody(BaseModelORM):
    name: str


class ClubUpdateBody(BaseModelORM):
    name: str
