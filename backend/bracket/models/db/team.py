from __future__ import annotations

# ruff: noqa: TCH001,TCH002
import json
from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel, Field, validator

from bracket.models.db.player import Player
from bracket.models.db.players import START_ELO
from bracket.models.db.shared import BaseModelORM
from bracket.utils.types import assert_some


class Team(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool
    elo_score: Decimal = Decimal(START_ELO)
    swiss_score: Decimal = Decimal('0.0')
    wins: int = 0
    draws: int = 0
    losses: int = 0


class TeamWithPlayers(BaseModel):
    id: int | None = None
    players: list[Player]
    elo_score: Decimal = Decimal(START_ELO)
    swiss_score: Decimal = Decimal('0.0')
    wins: int = 0
    draws: int = 0
    losses: int = 0
    name: str

    @property
    def player_ids(self) -> list[int]:
        return [assert_some(player.id) for player in self.players]

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
        return (
            Decimal(sum(player.elo_score for player in self.players)) / len(self.players)
            if len(self.players) > 0
            else self.elo_score
        )

    def get_swiss_score(self) -> Decimal:
        """
        The Swiss system score of a team.
        """
        return (
            Decimal(sum(player.swiss_score for player in self.players)) / len(self.players)
            if len(self.players) > 0
            else self.swiss_score
        )


class FullTeamWithPlayers(TeamWithPlayers, Team):
    pass


class TeamBody(BaseModelORM):
    name: str = Field(..., min_length=1, max_length=30)
    active: bool
    player_ids: list[int] = Field(..., unique_items=True)


class TeamMultiBody(BaseModelORM):
    names: str = Field(..., min_length=1)
    active: bool


class TeamToInsert(BaseModelORM):
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool
    elo_score: Decimal = Decimal('0.0')
    swiss_score: Decimal = Decimal('0.0')
    wins: int = 0
    draws: int = 0
    losses: int = 0
