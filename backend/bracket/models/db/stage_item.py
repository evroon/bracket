from enum import auto
from typing import Any

from heliclockter import datetime_utc
from pydantic import Field, model_validator

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.stage_item_inputs import StageItemInputCreateBody
from bracket.utils.id_types import StageId, StageItemId
from bracket.utils.types import EnumAutoStr


class StageType(EnumAutoStr):
    ROUND_ROBIN = auto()
    SINGLE_ELIMINATION = auto()
    SWISS = auto()

    @property
    def supports_dynamic_number_of_rounds(self) -> bool:
        return self in [StageType.SWISS]


class StageItemToInsert(BaseModelORM):
    id: StageItemId | None = None
    stage_id: StageId
    name: str
    created: datetime_utc
    type: StageType
    team_count: int = Field(ge=2, le=64)


class StageItem(StageItemToInsert):
    id: StageItemId


class StageItemUpdateBody(BaseModelORM):
    name: str


class StageItemActivateNextBody(BaseModelORM):
    adjust_to_time: datetime_utc | None = None


class StageItemCreateBody(BaseModelORM):
    stage_id: StageId
    name: str | None = None
    type: StageType
    team_count: int = Field(ge=2, le=64)
    inputs: list[StageItemInputCreateBody]

    def get_name_or_default_name(self) -> str:
        return self.name if self.name is not None else self.type.value.replace("_", " ").title()

    @model_validator(mode="before")
    def handle_inputs_length(cls, values: Any) -> Any:
        if ("inputs" in values and "team_count" in values) and (
            len(values["inputs"]) != values["team_count"]
        ):
            raise ValueError("team_count doesn't match length of inputs")
        return values
