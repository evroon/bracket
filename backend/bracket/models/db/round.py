from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Round(BaseModelORM):
    id: int | None = None
    stage_item_id: int
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
    stage_item_id: int


class RoundToInsert(RoundUpdateBody):
    created: datetime_utc
    stage_item_id: int
    is_draft: bool = False
    is_active: bool = False
