from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class Club(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc
