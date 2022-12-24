from heliclockter import datetime_utc
from pydantic import BaseModel

from ladderz.models.db.shared import BaseModelORM
from ladderz.models.db.team import Team, TeamWithPlayers


class Match(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    round_id: int
    team1_id: int
    team2_id: int
    team1_score: int
    team2_score: int


class UpcomingMatch(BaseModel):
    team1_id: int
    team2_id: int


class MatchWithTeamDetails(Match):
    team1: TeamWithPlayers
    team2: TeamWithPlayers
