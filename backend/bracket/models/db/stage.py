from typing import Literal

from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Stage(BaseModelORM):
    id: int | None = None
    tournament_id: int
    name: str
    created: datetime_utc
    is_active: bool


class StageUpdateBody(BaseModelORM):
    name: str


class StageActivateBody(BaseModelORM):
    direction: Literal['next', 'previous'] = 'next'
