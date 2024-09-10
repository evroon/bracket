from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import CourtId, TournamentId


class CourtInsertable(BaseModelORM):
    name: str
    created: datetime_utc
    tournament_id: TournamentId


class Court(CourtInsertable):
    id: CourtId


class CourtBody(BaseModelORM):
    name: str


class CourtToInsert(CourtBody):
    created: datetime_utc
    tournament_id: TournamentId
