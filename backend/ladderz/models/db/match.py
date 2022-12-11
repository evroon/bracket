from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class Match(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    round_id: int
    team1: int
    team2: int
