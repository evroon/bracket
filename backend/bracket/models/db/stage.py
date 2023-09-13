from enum import auto
from typing import Literal

from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.types import EnumAutoStr


class StageType(EnumAutoStr):
    SINGLE_ELIMINATION = auto()
    DOUBLE_ELIMINATION = auto()
    SWISS = auto()
    SWISS_DYNAMIC_TEAMS = auto()
    ROUND_ROBIN = auto()


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


class StageToInsert(BaseModelORM):
    created: datetime_utc
    tournament_id: int
    type: StageType
    is_active: bool = False
