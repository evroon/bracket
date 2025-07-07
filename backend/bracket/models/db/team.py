from __future__ import annotations

import json
from decimal import Decimal
from typing import Annotated

from heliclockter import datetime_utc
from pydantic import BaseModel, Field, StringConstraints, field_validator

from bracket.logic.ranking.statistics import START_ELO
from bracket.models.db.player import Player
from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, TeamId, TournamentId


class TeamInsertable(BaseModelORM):
    created: datetime_utc
    name: str
    tournament_id: TournamentId
    active: bool
    elo_score: Decimal = START_ELO
    swiss_score: Decimal = Decimal("0.0")
    wins: int = 0
    draws: int = 0
    losses: int = 0
    logo_path: str | None = None


class Team(TeamInsertable):
    id: TeamId


class TeamWithPlayers(BaseModel):
    id: TeamId
    players: list[Player]
    elo_score: Decimal = START_ELO
    swiss_score: Decimal = Decimal("0.0")
    wins: int = 0
    draws: int = 0
    losses: int = 0
    name: str
    logo_path: str | None = None

    @property
    def player_ids(self) -> list[PlayerId]:
        return [player.id for player in self.players]

    @field_validator("players", mode="before")
    def handle_players(values: list[Player]) -> list[Player]:  # type: ignore[misc]
        if isinstance(values, str):
            values_json = json.loads(values)
            if values_json == [None]:
                return []
            return values_json

        return values


class FullTeamWithPlayers(TeamWithPlayers, Team):
    pass


class TeamBody(BaseModelORM):
    name: Annotated[str, StringConstraints(min_length=1, max_length=30)]
    active: bool
    player_ids: set[PlayerId]


class TeamMultiBody(BaseModelORM):
    names: str = Field(..., min_length=1)
    active: bool
