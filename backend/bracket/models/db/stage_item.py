from enum import auto
from typing import Any

from heliclockter import datetime_utc
from pydantic import Field, root_validator

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.stage_item_inputs import StageItemInputCreateBody
from bracket.utils.types import EnumAutoStr


class StageType(EnumAutoStr):
    ROUND_ROBIN = auto()
    SINGLE_ELIMINATION = auto()
    SWISS = auto()

    @property
    def supports_dynamic_number_of_rounds(self) -> bool:
        return self in [StageType.SWISS]


class StageItemToInsert(BaseModelORM):
    id: int | None = None
    stage_id: int
    name: str
    created: datetime_utc
    type: StageType
    team_count: int = Field(ge=2, le=16)


class StageItem(StageItemToInsert):
    id: int


class StageItemUpdateBody(BaseModelORM):
    name: str


class StageItemCreateBody(BaseModelORM):
    stage_id: int
    name: str | None
    type: StageType
    team_count: int = Field(ge=2, le=16)
    inputs: list[StageItemInputCreateBody]

    def get_name_or_default_name(self) -> str:
        return self.name if self.name is not None else self.type.value.replace('_', ' ').title()

    @root_validator(pre=True)
    def handle_inputs_length(cls, values: Any) -> Any:
        assert len(values['inputs']) == values['team_count']
        return values
