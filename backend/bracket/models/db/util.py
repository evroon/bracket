from __future__ import annotations

# ruff: noqa: TCH001,TCH002
import json
from typing import Any

from pydantic import field_validator, model_validator

from bracket.models.db.match import Match, MatchWithDetails, MatchWithDetailsDefinitive
from bracket.models.db.round import Round
from bracket.models.db.stage import Stage
from bracket.models.db.stage_item import StageItem, StageType
from bracket.models.db.stage_item_inputs import StageItemInput


class RoundWithMatches(Round):
    matches: list[MatchWithDetailsDefinitive | MatchWithDetails]

    @field_validator("matches", mode="before")
    def handle_matches(values: list[Match]) -> list[Match]:  # type: ignore[misc]
        if values == [None]:
            return []
        return values


class StageItemWithRounds(StageItem):
    rounds: list[RoundWithMatches]
    inputs: list[StageItemInput]
    type_name: str

    @model_validator(mode="before")
    def fill_type_name(cls, values: Any) -> Any:
        match values["type"]:
            case str() as type_:
                values["type_name"] = type_.lower().capitalize().replace("_", " ")
            case StageType() as type_:
                values["type_name"] = type_.value.lower().capitalize().replace("_", " ")

        return values

    @field_validator("rounds", "inputs", mode="before")
    def handle_empty_list_elements(values: list[Any] | None) -> list[Any]:  # type: ignore[misc]
        if values is None:
            return []
        return [value for value in values if value is not None]


class StageWithStageItems(Stage):
    stage_items: list[StageItemWithRounds]

    @field_validator("stage_items", mode="before")
    def handle_stage_items(values: list[StageItemWithRounds]) -> list[StageItemWithRounds]:  # type: ignore[misc]
        if isinstance(values, str):
            values_json = json.loads(values)
            if values_json == [None]:
                return []
            return values_json

        return values
