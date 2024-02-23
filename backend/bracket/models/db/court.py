from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import CourtId, TournamentId


class Court(BaseModelORM):
    id: CourtId | None = None
    name: str
    created: datetime_utc
    tournament_id: TournamentId


class CourtBody(BaseModelORM):
    name: str


class CourtToInsert(CourtBody):
    created: datetime_utc
    tournament_id: TournamentId
