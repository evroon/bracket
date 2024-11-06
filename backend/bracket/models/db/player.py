from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import Field

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import PlayerId, TournamentId


class PlayerInsertable(BaseModelORM):
    active: bool
    name: str
    created: datetime_utc
    tournament_id: TournamentId
    elo_score: Decimal = Decimal("0.0")
    swiss_score: Decimal = Decimal("0.0")
    wins: int = 0
    draws: int = 0
    losses: int = 0


class Player(PlayerInsertable):
    id: PlayerId

    def __hash__(self) -> int:
        return self.id


class PlayerBody(BaseModelORM):
    name: str = Field(..., min_length=1, max_length=30)
    active: bool


class PlayerMultiBody(BaseModelORM):
    names: str = Field(..., min_length=1)
    active: bool


class PlayerToInsert(PlayerBody):
    created: datetime_utc
    tournament_id: TournamentId
    elo_score: Decimal = Decimal("1200.0")
    swiss_score: Decimal
    wins: int = 0
    draws: int = 0
    losses: int = 0
