from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import RankingId, TournamentId


class RankingInsertable(BaseModel):
    tournament_id: TournamentId
    win_points: Decimal
    draw_points: Decimal
    loss_points: Decimal
    add_score_points: bool
    position: int


class Ranking(BaseModelORM, RankingInsertable):
    id: RankingId
    created: datetime_utc


class RankingBody(BaseModel):
    win_points: Decimal
    draw_points: Decimal
    loss_points: Decimal
    add_score_points: bool
    position: int


class RankingCreateBody(BaseModel):
    win_points: Decimal = Decimal("1.0")
    draw_points: Decimal = Decimal("0.5")
    loss_points: Decimal = Decimal("0.0")
    add_score_points: bool = False
