from decimal import Decimal

from pydantic import BaseModel

START_ELO: int = 1200


class PlayerStatistics(BaseModel):
    wins: int = 0
    draws: int = 0
    losses: int = 0
    elo_score: int = START_ELO
    swiss_score: Decimal = Decimal("0.00")
