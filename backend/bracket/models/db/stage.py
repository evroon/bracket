from enum import auto
from typing import Literal

from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.types import EnumAutoStr


class StageType(EnumAutoStr):
    DOUBLE_ELIMINATION = auto()
    ROUND_ROBIN = auto()
    SINGLE_ELIMINATION = auto()
    SWISS = auto()
    SWISS_DYNAMIC_TEAMS = auto()


class Stage(BaseModelORM):
    id: int | None = None
    tournament_id: int
    created: datetime_utc
    type: StageType
    is_active: bool


class StageUpdateBody(BaseModelORM):
    is_active: bool


class StageActivateBody(BaseModelORM):
    direction: Literal['next', 'previous'] = 'next'


class StageCreateBody(BaseModelORM):
    type: StageType
