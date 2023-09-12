from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel

from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import FullTeamWithPlayers, TeamWithPlayers
from bracket.utils.types import assert_some


class Match(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    round_id: int
    team1_id: int
    team2_id: int
    team1_score: int
    team2_score: int
    court_id: int | None


class UpcomingMatch(BaseModel):
    team1_id: int
    team2_id: int


class MatchWithTeamDetails(Match):
    team1: FullTeamWithPlayers
    team2: FullTeamWithPlayers

    @property
    def teams(self) -> list[FullTeamWithPlayers]:
        return [self.team1, self.team2]

    @property
    def team_ids(self) -> list[int]:
        return [assert_some(self.team1.id), assert_some(self.team2.id)]

    @property
    def player_ids(self) -> list[int]:
        return self.team1.player_ids + self.team2.player_ids


class MatchBody(BaseModelORM):
    round_id: int
    team1_score: int = 0
    team2_score: int = 0
    court_id: int | None


class MatchCreateBody(BaseModelORM):
    round_id: int
    team1_id: int
    team2_id: int
    court_id: int | None


class MatchToInsert(MatchCreateBody):
    created: datetime_utc
    team1_score: int = 0
    team2_score: int = 0


class MatchFilter(BaseModel):
    elo_diff_threshold: int
    only_behind_schedule: bool
    limit: int
    iterations: int


class SuggestedMatch(BaseModel):
    team1: TeamWithPlayers
    team2: TeamWithPlayers
    elo_diff: Decimal
    swiss_diff: Decimal
    is_recommended: bool
    player_behind_schedule_count: int

    def __hash__(self) -> int:
        return sum(
            pow(100, i) + player.id
            for i, player in enumerate(self.team1.players + self.team2.players)
        )
