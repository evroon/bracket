from heliclockter import datetime_utc

from ladderz.models.db.shared import BaseModelORM


class Round(BaseModelORM):
    id: int | None = None
    tournament_id: int
    created: datetime_utc
    is_draft: bool
    round_index: int
