from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import Team, TeamWithPlayers


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

    @property
    def teams(self) -> list[TeamWithPlayers]:
        return [self.team1, self.team2]


class MatchBody(BaseModelORM):
    round_id: int
    team1_score: int = 0
    team2_score: int = 0


class MatchToInsert(MatchBody):
    created: datetime_utc
    team1_id: int
    team2_id: int


class MatchFilter(BaseModel):
    elo_diff: int = 100


class SuggestedMatch(BaseModel):
    team1: TeamWithPlayers
    team2: TeamWithPlayers
    elo_diff: Decimal
