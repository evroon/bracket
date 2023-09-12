import json
from typing import Any

from heliclockter import datetime_utc
from pydantic import root_validator, validator

from bracket.models.db.match import Match, MatchWithDetails
from bracket.models.db.shared import BaseModelORM
from bracket.models.db.stage import Stage, StageType
from bracket.utils.types import assert_some


class Round(BaseModelORM):
    id: int | None = None
    stage_id: int
    created: datetime_utc
    is_draft: bool
    is_active: bool = False
    name: str


class RoundWithMatches(Round):
    matches: list[MatchWithDetails]

    @validator('matches', pre=True)
    def handle_matches(values: list[Match]) -> list[Match]:  # type: ignore[misc]
        if values == [None]:
            return []
        return values

    def get_team_ids(self) -> set[int]:
        return {assert_some(team.id) for match in self.matches for team in match.teams}


class StageWithRounds(Stage):
    rounds: list[RoundWithMatches]
    type_name: str

    @root_validator(pre=True)
    def fill_type_name(cls, values: Any) -> Any:
        match values['type']:
            case str() as type_:
                values['type_name'] = type_.lower().capitalize().replace('_', ' ')
            case StageType() as type_:
                values['type_name'] = type_.value.lower().capitalize().replace('_', ' ')

        return values

    @validator('rounds', pre=True)
    def handle_rounds(values: list[Round]) -> list[Round]:  # type: ignore[misc]
        if isinstance(values, str):
            values_json = json.loads(values)
            if values_json == [None]:
                return []
            return values_json

        return values


class RoundUpdateBody(BaseModelORM):
    name: str
    is_draft: bool
    is_active: bool


class RoundCreateBody(BaseModelORM):
    name: str | None
    stage_id: int


class RoundToInsert(RoundUpdateBody):
    created: datetime_utc
    stage_id: int
    is_draft: bool = False
    is_active: bool = False
