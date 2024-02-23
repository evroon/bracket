from decimal import Decimal

from heliclockter import datetime_utc, timedelta
from pydantic import BaseModel

from bracket.models.db.court import Court
from bracket.models.db.shared import BaseModelORM
from bracket.models.db.team import FullTeamWithPlayers, TeamWithPlayers
from bracket.utils.id_types import CourtId, MatchId, PlayerId, RoundId, StageItemId, TeamId
from bracket.utils.types import assert_some


class MatchBase(BaseModelORM):
    id: MatchId | None = None
    created: datetime_utc
    start_time: datetime_utc | None = None
    duration_minutes: int
    margin_minutes: int
    custom_duration_minutes: int | None = None
    custom_margin_minutes: int | None = None
    position_in_schedule: int | None = None
    round_id: RoundId
    team1_score: int
    team2_score: int
    court_id: CourtId | None = None

    @property
    def end_time(self) -> datetime_utc:
        assert self.start_time
        return datetime_utc.from_datetime(
            self.start_time + timedelta(minutes=self.duration_minutes + self.margin_minutes)
        )


class Match(MatchBase):
    team1_id: TeamId | None = None
    team2_id: TeamId | None = None
    team1_winner_position: int | None = None
    team1_winner_from_stage_item_id: StageItemId | None = None
    team2_winner_from_stage_item_id: StageItemId | None = None
    team2_winner_position: int | None = None
    team1_winner_from_match_id: MatchId | None = None
    team2_winner_from_match_id: MatchId | None = None

    def get_winner_index(self) -> int | None:
        if self.team1_score == self.team2_score:
            return None

        return 1 if self.team1_score > self.team2_score else 0


class MatchWithDetails(Match):
    court: Court | None = None


def get_match_hash(team_1_id: TeamId | None, team_2_id: TeamId | None) -> str:
    return f"{team_1_id}-{team_2_id}"


class MatchWithDetailsDefinitive(Match):
    team1: FullTeamWithPlayers
    team2: FullTeamWithPlayers
    court: Court | None = None

    @property
    def teams(self) -> list[FullTeamWithPlayers]:
        return [self.team1, self.team2]

    @property
    def team_ids(self) -> list[TeamId]:
        return [assert_some(self.team1.id), assert_some(self.team2.id)]

    def get_team_ids_hashes(self) -> list[str]:
        return [
            get_match_hash(self.team1_id, self.team2_id),
            get_match_hash(self.team2_id, self.team1_id),
        ]

    @property
    def player_ids(self) -> list[PlayerId]:
        return self.team1.player_ids + self.team2.player_ids


class MatchBody(BaseModelORM):
    round_id: RoundId
    team1_score: int = 0
    team2_score: int = 0
    court_id: CourtId | None = None
    custom_duration_minutes: int | None = None
    custom_margin_minutes: int | None = None


class MatchCreateBodyFrontend(BaseModelORM):
    round_id: RoundId
    court_id: CourtId | None = None
    team1_id: TeamId | None = None
    team2_id: TeamId | None = None
    team1_winner_from_stage_item_id: StageItemId | None = None
    team1_winner_position: int | None = None
    team1_winner_from_match_id: MatchId | None = None
    team2_winner_from_stage_item_id: StageItemId | None = None
    team2_winner_position: int | None = None
    team2_winner_from_match_id: MatchId | None = None


class MatchCreateBody(MatchCreateBodyFrontend):
    duration_minutes: int
    margin_minutes: int
    custom_duration_minutes: int | None = None
    custom_margin_minutes: int | None = None


class MatchRescheduleBody(BaseModelORM):
    old_court_id: CourtId
    old_position: int
    new_court_id: CourtId
    new_position: int


class MatchFilter(BaseModel):
    elo_diff_threshold: int
    only_recommended: bool
    limit: int
    iterations: int


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
