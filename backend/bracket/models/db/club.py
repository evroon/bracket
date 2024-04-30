from heliclockter import datetime_tz

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import ClubId


class Club(BaseModelORM):
    id: ClubId | None = None
    name: str
    created: datetime_tz


class ClubCreateBody(BaseModelORM):
    name: str


class ClubUpdateBody(BaseModelORM):
    name: str
