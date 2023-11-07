from heliclockter import datetime_utc

from bracket.models.db.shared import BaseModelORM


class Tournament(BaseModelORM):
    id: int | None = None
    club_id: int
    name: str
    created: datetime_utc
    start_time: datetime_utc
    dashboard_public: bool
    dashboard_endpoint: str | None
    logo_path: str | None
    players_can_be_in_multiple_teams: bool
    auto_assign_courts: bool


class TournamentUpdateBody(BaseModelORM):
    start_time: datetime_utc
    name: str
    dashboard_public: bool
    dashboard_endpoint: str | None
    players_can_be_in_multiple_teams: bool
    auto_assign_courts: bool


class TournamentBody(TournamentUpdateBody):
    club_id: int


class TournamentToInsert(TournamentBody):
    created: datetime_utc
