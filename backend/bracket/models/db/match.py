from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import TeamWithPlayers
from bracket.utils.types import assert_some


class Match(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    round_id: int
    team1_id: int
    team2_id: int
    team1_score: int
    team2_score: int
    label: str


class UpcomingMatch(BaseModel):
    team1_id: int
    team2_id: int


class MatchWithTeamDetails(Match):
    team1: TeamWithPlayers
    team2: TeamWithPlayers

    @property
    def teams(self) -> list[TeamWithPlayers]:
        return [self.team1, self.team2]

    @property
    def team_ids(self) -> list[int]:
        return [assert_some(self.team1.id), assert_some(self.team2.id)]


class MatchBody(BaseModelORM):
    round_id: int
    team1_score: int = 0
    team2_score: int = 0
    label: str


class MatchCreateBody(BaseModelORM):
    round_id: int
    team1_id: int
    team2_id: int
    label: str


class MatchToInsert(MatchCreateBody):
    created: datetime_utc
    team1_score: int = 0
    team2_score: int = 0


class MatchFilter(BaseModel):
    elo_diff: int = 100


class SuggestedMatch(BaseModel):
    team1: TeamWithPlayers
    team2: TeamWithPlayers
    elo_diff: Decimal
    swiss_diff: Decimal
