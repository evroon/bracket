from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import RoundId, StageItemId


class Round(BaseModelORM):
    id: RoundId | None = None
    stage_item_id: StageItemId
    created: datetime_utc
    is_draft: bool
    is_active: bool = False
    name: str


class RoundUpdateBody(BaseModelORM):
    name: str
    is_draft: bool
    is_active: bool


class RoundCreateBody(BaseModelORM):
    name: str | None = None
    stage_item_id: StageItemId


class RoundToInsert(RoundUpdateBody):
    stage_item_id: StageItemId
    is_draft: bool = False
    is_active: bool = False
