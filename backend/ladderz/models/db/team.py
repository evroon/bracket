from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class Team(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool


class TeamBody(BaseModelORM):
    name: str
    active: bool


class TeamToInsert(TeamBody):
    created: datetime_utc
    tournament_id: int
