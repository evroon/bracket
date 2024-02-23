from zoneinfo import ZoneInfo

from heliclockter import datetime_utc

from bracket.models.db.account import UserAccountType
from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match
from bracket.models.db.player import Player
from bracket.models.db.player_x_team import PlayerXTeam
from bracket.models.db.round import Round
from bracket.models.db.stage import Stage
from bracket.models.db.stage_item import StageItemToInsert, StageType
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User
from bracket.utils.id_types import (
    ClubId,
    CourtId,
    PlayerId,
    RoundId,
    StageId,
    StageItemId,
    TeamId,
    TournamentId,
)
from bracket.utils.security import hash_password

DUMMY_MOCK_TIME = datetime_utc(2022, 1, 11, 4, 32, 11, tzinfo=ZoneInfo("UTC"))

# We don't know any db IDs here, so we use a placeholder for foreign keys.
DB_PLACEHOLDER_ID = -42

DUMMY_CLUB = Club(
    name="Some Cool Club",
    created=DUMMY_MOCK_TIME,
)

DUMMY_TOURNAMENT = Tournament(
    club_id=ClubId(DB_PLACEHOLDER_ID),
    name="Some Cool Tournament",
    created=DUMMY_MOCK_TIME,
    start_time=DUMMY_MOCK_TIME,
    dashboard_public=True,
    dashboard_endpoint=None,
    logo_path=None,
    players_can_be_in_multiple_teams=True,
    auto_assign_courts=True,
    duration_minutes=10,
    margin_minutes=5,
)

DUMMY_STAGE1 = Stage(
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_active=True,
    name="Group Stage",
)

DUMMY_STAGE2 = Stage(
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_active=False,
    name="Knockout Stage",
)

DUMMY_STAGE_ITEM1 = StageItemToInsert(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name="Group A",
)

DUMMY_STAGE_ITEM2 = StageItemToInsert(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name="Group B",
)

DUMMY_STAGE_ITEM3 = StageItemToInsert(
    stage_id=StageId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    type=StageType.SINGLE_ELIMINATION,
    team_count=4,
    name="Bracket A",
)

DUMMY_ROUND1 = Round(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name="Round 1",
)

DUMMY_ROUND2 = Round(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=True,
    name="Round 2",
)

DUMMY_ROUND3 = Round(
    stage_item_id=StageItemId(DB_PLACEHOLDER_ID),
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name="Round 3",
)

DUMMY_MATCH1 = Match(
    created=DUMMY_MOCK_TIME,
    start_time=DUMMY_MOCK_TIME,
    round_id=RoundId(DB_PLACEHOLDER_ID),
    team1_id=TeamId(DB_PLACEHOLDER_ID),
    team2_id=TeamId(DB_PLACEHOLDER_ID),
    team1_score=11,
    team2_score=22,
    court_id=CourtId(DB_PLACEHOLDER_ID),
    team1_winner_from_stage_item_id=None,
    team1_winner_position=None,
    team1_winner_from_match_id=None,
    team2_winner_from_stage_item_id=None,
    team2_winner_position=None,
    team2_winner_from_match_id=None,
    duration_minutes=10,
    margin_minutes=5,
    custom_duration_minutes=None,
    custom_margin_minutes=None,
    position_in_schedule=1,
)

DUMMY_USER = User(
    email="admin@example.com",
    name="Admin",
    password_hash=hash_password("adminadmin"),
    created=DUMMY_MOCK_TIME,
    account_type=UserAccountType.REGULAR,
)

DUMMY_TEAM1 = Team(
    created=DUMMY_MOCK_TIME,
    name="Team 1",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM2 = Team(
    created=DUMMY_MOCK_TIME,
    name="Team 2",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM3 = Team(
    created=DUMMY_MOCK_TIME,
    name="Team 3",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)

DUMMY_TEAM4 = Team(
    created=DUMMY_MOCK_TIME,
    name="Team 4",
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
    active=True,
)


DUMMY_PLAYER1 = Player(
    name="Player 01",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER2 = Player(
    name="Player 02",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER3 = Player(
    name="Player 03",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER4 = Player(
    name="Player 04",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER5 = Player(
    name="Player 05",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER6 = Player(
    name="Player 06",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER7 = Player(
    name="Player 07",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER8 = Player(
    name="Player 08",
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_PLAYER_X_TEAM = PlayerXTeam(
    player_id=PlayerId(DB_PLACEHOLDER_ID),
    team_id=TeamId(DB_PLACEHOLDER_ID),
)

DUMMY_COURT1 = Court(
    name="Court 1",
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)

DUMMY_COURT2 = Court(
    name="Court 2",
    created=DUMMY_MOCK_TIME,
    tournament_id=TournamentId(DB_PLACEHOLDER_ID),
)
