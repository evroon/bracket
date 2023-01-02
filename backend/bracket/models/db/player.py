from decimal import Decimal

from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Player(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc
    team_id: int | None = None
    tournament_id: int
    elo_score: Decimal = Decimal('0.0')
    swiss_score: Decimal = Decimal('0.0')
    wins: int = 0
    draws: int = 0
    losses: int = 0


class PlayerBody(BaseModelORM):
    name: str


class PlayerToInsert(PlayerBody):
    created: datetime_utc
    tournament_id: int
    elo_score: Decimal
    swiss_score: Decimal
    wins: int = 0
    draws: int = 0
    losses: int = 0
