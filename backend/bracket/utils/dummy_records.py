from decimal import Decimal
from zoneinfo import ZoneInfo

from heliclockter import datetime_utc

from bracket.models.db.account import UserAccountType
from bracket.models.db.club import ClubInsertable
from bracket.models.db.court import CourtInsertable
from bracket.models.db.match import MatchInsertable
from bracket.models.db.player import PlayerInsertable
from bracket.models.db.player_x_team import PlayerXTeamInsertable
from bracket.models.db.ranking import RankingInsertable
from bracket.models.db.round import RoundInsertable
from bracket.models.db.stage import StageInsertable
from bracket.models.db.stage_item import StageItemInsertable, StageType
from bracket.models.db.team import TeamInsertable
from bracket.models.db.tournament import TournamentInsertable
from bracket.models.db.user import UserInsertable
from bracket.utils.id_types import (
    ClubId,
    CourtId,
    PlayerId,
    RankingId,
    RoundId,
    StageId,
    StageItemId,
    StageItemInputId,
    TeamId,
    TournamentId,
)
from bracket.utils.security import hash_password

DUMMY_MOCK_TIME = datetime_utc(2022, 1, 11, 4, 32, 11, tzinfo=ZoneInfo("UTC"))

# We don't know any db IDs here, so we use a placeholder for foreign keys.
DB_PLACEHOLDER_ID = -42

DUMMY_CLUB = ClubInsertable(
    name="Some Cool Club",
    created=DUMMY_MOCK_TIME,
)

DUMMY_TOURNAMENT = TournamentInsertable(
    club_id=ClubId(DB_PLACEHOLDER_ID),
    name="Some Cool Tournament",
    created=DUMMY_MOCK_TIME,
    start_time=DUMMY_MOCK_TIME,
    dashboard_public=True,
    dashboard_endpoint="endpoint-test",
    logo_path=None,
    players_can_be_in_multiple_teams=True,
    auto_assign_courts=True,
    duration_minutes=10,
    margin_minutes=5,
)

DUMMY_STAGE1 = StageInsertable(
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_active=True,
    name="Group Stage",
)

DUMMY_STAGE2 = StageInsertable(
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_active=False,
    name="Knockout Stage",
)

DUMMY_STAGE_ITEM1 = StageItemInsertable(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    ranking_id=RankingId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name="Group A",
)

DUMMY_STAGE_ITEM2 = StageItemInsertable(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    ranking_id=RankingId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name="Group B",
)

DUMMY_STAGE_ITEM3 = StageItemInsertable(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    ranking_id=RankingId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.SINGLE_ELIMINATION,
    team_count=4,
    name="Bracket A",
)

DUMMY_ROUND1 = RoundInsertable(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name="Round 1",
)

DUMMY_ROUND2 = RoundInsertable(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=True,
    name="Round 2",
)

DUMMY_ROUND3 = RoundInsertable(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name="Round 3",
)

DUMMY_MATCH1 = MatchInsertable(
    created=DUMMY_MOCK_TIME,
    start_time=DUMMY_MOCK_TIME,
    round_id=RoundId(DB_PLACEHOLDER_ID),
    stage_item_input1_id=StageItemInputId(DB_PLACEHOLDER_ID),
    stage_item_input2_id=StageItemInputId(DB_PLACEHOLDER_ID),
    stage_item_input1_score=11,
    stage_item_input2_score=22,
    court_id=CourtId(DB_PLACEHOLDER_ID),
    stage_item_input1_winner_from_match_id=None,
    stage_item_input2_winner_from_match_id=None,
    duration_minutes=10,
    margin_minutes=5,
    custom_duration_minutes=None,
    custom_margin_minutes=None,
    position_in_schedule=1,
    stage_item_input1_conflict=False,
    stage_item_input2_conflict=False,
)

DUMMY_USER = UserInsertable(
    email="admin@example.com",
    name="Admin",
    password_hash=hash_password("adminadmin"),
    created=DUMMY_MOCK_TIME,
    account_type=UserAccountType.REGULAR,
)

DUMMY_TEAM1 = TeamInsertable(
    created=DUMMY_MOCK_TIME,
    name="Team 1",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM2 = TeamInsertable(
    created=DUMMY_MOCK_TIME,
    name="Team 2",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM3 = TeamInsertable(
    created=DUMMY_MOCK_TIME,
    name="Team 3",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM4 = TeamInsertable(
    created=DUMMY_MOCK_TIME,
    name="Team 4",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)


DUMMY_PLAYER1 = PlayerInsertable(
    name="Player 01",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER2 = PlayerInsertable(
    name="Player 02",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER3 = PlayerInsertable(
    name="Player 03",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER4 = PlayerInsertable(
    name="Player 04",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER5 = PlayerInsertable(
    name="Player 05",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER6 = PlayerInsertable(
    name="Player 06",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER7 = PlayerInsertable(
    name="Player 07",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER8 = PlayerInsertable(
    name="Player 08",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER_X_TEAM = PlayerXTeamInsertable(
    player_id=PlayerId(DB_PLACEHOLDER_ID),
    team_id=TeamId(DB_PLACEHOLDER_ID),
)

DUMMY_COURT1 = CourtInsertable(
    name="Court 1",
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_COURT2 = CourtInsertable(
    name="Court 2",
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_RANKING1 = RankingInsertable(
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    win_points=Decimal("1.0"),
    draw_points=Decimal("0.5"),
    loss_points=Decimal("0.0"),
    add_score_points=False,
    position=0,
)
