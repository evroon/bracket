from decimal import Decimal

from heliclockter import datetime_utc
from pydantic import BaseModel

from bracket.models.db.court import Court
from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import FullTeamWithPlayers, TeamWithPlayers
from bracket.utils.types import assert_some


class MatchBase(BaseModelORM):
    id: int | None = None
    created: datetime_utc
    round_id: int
    team1_score: int
    team2_score: int
    court_id: int | None


class Match(MatchBase):
    team1_id: int
    team2_id: int


class MatchWithDetails(Match):
    team1: FullTeamWithPlayers
    team2: FullTeamWithPlayers
    court: Court | None

    @property
    def teams(self) -> list[FullTeamWithPlayers]:
        return [self.team1, self.team2]

    @property
    def team_ids(self) -> list[int]:
        return [assert_some(self.team1.id), assert_some(self.team2.id)]

    @property
    def player_ids(self) -> list[int]:
        return self.team1.player_ids + self.team2.player_ids

    def get_winner(self) -> FullTeamWithPlayers | None:
        if self.team1.elo_score == self.team2.elo_score:
            return None
        return self.team1 if self.team1.elo_score > self.team2.elo_score else self.team2


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


class MatchVirtualCreateBody(BaseModelORM):
    round_id: int
    court_id: int | None
    team1_stage_item_id: int
    team1_position_in_group: int
    team2_stage_item_id: int
    team2_position_in_group: int


class MatchFilter(BaseModel):
    elo_diff_threshold: int
    only_behind_schedule: bool
    limit: int
    iterations: int


class SuggestedVirtualMatch(BaseModel):
    team1_group_id: int
    team1_position_in_group: int
    team2_group_id: int
    team2_position_in_group: int


class SuggestedMatch(BaseModel):
    team1: TeamWithPlayers
    team2: TeamWithPlayers
    elo_diff: Decimal
    swiss_diff: Decimal
    is_recommended: bool
    player_behind_schedule_count: int

    @property
    def team_ids(self) -> list[int]:
        return [assert_some(self.team1.id), assert_some(self.team2.id)]

    def __hash__(self) -> int:
        return sum(
            pow(100, i) + player.id
            for i, player in enumerate(self.team1.players + self.team2.players)
        )
