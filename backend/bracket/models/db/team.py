import json
from decimal import Decimal

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

    def get_elo(self) -> Decimal:
        """
        The ELO score of a team is the average of all player's ELO scores.
        """
        return Decimal(sum(player.elo_score for player in self.players)) / len(self.players)

    def get_swiss_score(self) -> Decimal:
        """
        The Swiss system score of a team.
        """
        return Decimal(sum(player.swiss_score for player in self.players)) / len(self.players)


class TeamBody(BaseModelORM):
    name: str
    active: bool
    player_ids: list[int]


class TeamToInsert(BaseModelORM):
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool
