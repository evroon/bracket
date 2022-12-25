import json

from heliclockter import datetime_utc
from pydantic import validator

from ladderz.models.db.match import Match, MatchWithTeamDetails
from ladderz.models.db.shared import BaseModelORM


class Round(BaseModelORM):
    id: int | None = None
    tournament_id: int
    created: datetime_utc
    is_draft: bool
    is_active: bool = False
    name: str


class RoundWithMatches(Round):
    matches: list[MatchWithTeamDetails]

    @validator('matches', pre=True)
    def handle_players(values: list[Match]) -> list[Match]:  # type: ignore[misc]
        if isinstance(values, str):
            values_json = json.loads(values)
            if values_json == [None]:
                return []
            return values_json

        return values


class RoundToInsert(BaseModelORM):
    created: datetime_utc
    tournament_id: int
    is_draft: bool = False
    is_active: bool = False
    name: str


class RoundBody(BaseModelORM):
    name: str
    is_draft: bool
    is_active: bool
