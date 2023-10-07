from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Court(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc
    tournament_id: int


class CourtBody(BaseModelORM):
    name: str


class CourtToInsert(CourtBody):
    created: datetime_utc
    tournament_id: int
