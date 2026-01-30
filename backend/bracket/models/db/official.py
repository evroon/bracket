from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM
from bracket.utils.id_types import OfficialId, TournamentId


class OfficialInsertable(BaseModelORM):
    name: str
    access_code: str
    created: datetime_utc
    tournament_id: TournamentId


class Official(OfficialInsertable):
    id: OfficialId


class OfficialBody(BaseModelORM):
    name: str


class OfficialToInsert(OfficialBody):
    access_code: str
    created: datetime_utc
    tournament_id: TournamentId
