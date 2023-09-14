from __future__ import annotations

# ruff: noqa: TCH001,TCH002
import json
from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel, validator

from bracket.models.db.player import Player
from bracket.models.db.shared import BaseModelORM
from bracket.utils.types import assert_some


class Team(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool


class TeamWithPlayers(BaseModel):
    id: int | None = None
    players: list[Player]
    swiss_score: Decimal
    elo_score: Decimal
    wins: int
    draws: int
    losses: int

    @classmethod
    def from_players(cls, players: list[Player]) -> TeamWithPlayers:
        return TeamWithPlayers(
            players=players,
            elo_score=Decimal(sum(p.elo_score for p in players) / len(players)),
            swiss_score=Decimal(sum(p.swiss_score for p in players) / len(players)),
            wins=sum(p.wins for p in players) // len(players),
            draws=sum(p.draws for p in players) // len(players),
            losses=sum(p.losses for p in players) // len(players),
        )

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
            else Decimal('0.00')
        )

    def get_swiss_score(self) -> Decimal:
        """
        The Swiss system score of a team.
        """
        return (
            Decimal(sum(player.swiss_score for player in self.players)) / len(self.players)
            if len(self.players) > 0
            else Decimal('0.00')
        )


class FullTeamWithPlayers(TeamWithPlayers, Team):
    pass


class TeamBody(BaseModelORM):
    name: str
    active: bool
    player_ids: list[int]


class TeamToInsert(BaseModelORM):
    created: datetime_utc
    name: str
    tournament_id: int
    active: bool
