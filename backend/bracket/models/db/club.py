from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import ClubId


class ClubInsertable(BaseModelORM):
    name: str
    created: datetime_utc


class Club(ClubInsertable):
    id: ClubId


class ClubCreateBody(BaseModelORM):
    name: str


class ClubUpdateBody(BaseModelORM):
    name: str
