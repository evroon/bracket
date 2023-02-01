from decimal import Decimal

from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Player(BaseModelORM):
    id: int | None = None
    active: bool
    name: str
    created: datetime_utc
    tournament_id: int
    elo_score: Decimal = Decimal('0.0')
    swiss_score: Decimal = Decimal('0.0')
    wins: int = 0
    draws: int = 0
    losses: int = 0

    def __hash__(self) -> int:
        return self.id


class PlayerBody(BaseModelORM):
    name: str
    active: bool


class PlayerToInsert(PlayerBody):
    created: datetime_utc
    tournament_id: int
    elo_score: Decimal = Decimal('1200.0')
    swiss_score: Decimal
    wins: int = 0
    draws: int = 0
    losses: int = 0
