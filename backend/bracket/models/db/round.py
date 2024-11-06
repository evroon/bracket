from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import RoundId, StageItemId


class RoundInsertable(BaseModelORM):
    created: datetime_utc
    stage_item_id: StageItemId
    is_draft: bool
    name: str


class Round(RoundInsertable):
    id: RoundId


class RoundUpdateBody(BaseModelORM):
    name: str
    is_draft: bool


class RoundCreateBody(BaseModelORM):
    name: str | None = None
    stage_item_id: StageItemId
