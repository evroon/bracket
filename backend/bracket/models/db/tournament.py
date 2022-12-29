from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Tournament(BaseModelORM):
    id: int | None = None
    club_id: int
    name: str
    created: datetime_utc


class TournamentBody(BaseModelORM):
    name: str
    club_id: int


class TournamentToInsert(TournamentBody):
    created: datetime_utc
