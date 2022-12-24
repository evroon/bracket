from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class Player(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc
    team_id: int | None = None
    tournament_id: int
    elo_score: float


class PlayerBody(BaseModelORM):
    name: str
    team_id: int | None


class PlayerToInsert(PlayerBody):
    created: datetime_utc
    tournament_id: int
