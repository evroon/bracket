from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Tournament(BaseModelORM):
    id: int | None = None
    club_id: int
    name: str
    created: datetime_utc
    dashboard_public: bool


class TournamentBody(BaseModelORM):
    name: str
    club_id: int
    dashboard_public: bool


class TournamentToInsert(TournamentBody):
    created: datetime_utc
