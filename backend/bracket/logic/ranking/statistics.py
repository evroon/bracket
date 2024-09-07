from decimal import Decimal

from pydantic import BaseModel

START_ELO = Decimal("1200")


class TeamStatistics(BaseModel):
    wins: int = 0
    draws: int = 0
    losses: int = 0
    points: Decimal = Decimal("0.00")
