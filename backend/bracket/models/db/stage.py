from typing import Literal

from heliclockter import datetime_tz

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import StageId, TournamentId


class Stage(BaseModelORM):
    id: StageId | None = None
    tournament_id: TournamentId
    name: str
    created: datetime_tz
    is_active: bool


class StageUpdateBody(BaseModelORM):
    name: str


class StageActivateBody(BaseModelORM):
    direction: Literal["next", "previous"] = "next"
