import json

from heliclockter import datetime_utc
from pydantic import validator

from bracket.models.db.player import Player
from bracket.models.db.shared import BaseModelORM


class Team(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool


class TeamWithPlayers(Team):
    players: list[Player]

    @validator('players', pre=True)
    def handle_players(values: list[Player]) -> list[Player]:  # type: ignore[misc]
        if isinstance(values, str):
            values_json = json.loads(values)
            if values_json == [None]:
                return []
            return values_json

        return values


class TeamBody(BaseModelORM):
    name: str
    active: bool
    player_ids: list[int]


class TeamToInsert(BaseModelORM):
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool
