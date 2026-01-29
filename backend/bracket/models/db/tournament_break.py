from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import BreakId, TournamentId


class TournamentBreakInsertable(BaseModelORM):
    title: str
    start_time: datetime_utc
    end_time: datetime_utc
    created: datetime_utc
    tournament_id: TournamentId


class TournamentBreak(TournamentBreakInsertable):
    id: BreakId


class TournamentBreakBody(BaseModelORM):
    title: str
    start_time: datetime_utc
    end_time: datetime_utc


class TournamentBreakToInsert(TournamentBreakBody):
    created: datetime_utc
    tournament_id: TournamentId
