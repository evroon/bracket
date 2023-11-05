from zoneinfo import ZoneInfo

from heliclockter import datetime_utc

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
from bracket.models.db.user_x_club import UserXClub
from bracket.utils.security import pwd_context

DUMMY_MOCK_TIME = datetime_utc(2022, 1, 11, 4, 32, 11, tzinfo=ZoneInfo('UTC'))

# We don't know any db IDs here, so we use a placeholder for foreign keys.
DB_PLACEHOLDER_ID = -42

DUMMY_CLUB = Club(
    name='Some Cool Club',
    created=DUMMY_MOCK_TIME,
)

DUMMY_TOURNAMENT = Tournament(
    club_id=DB_PLACEHOLDER_ID,
    name='Some Cool Tournament',
    created=DUMMY_MOCK_TIME,
    dashboard_public=True,
    dashboard_endpoint='cool-tournament',
    logo_path=None,
    players_can_be_in_multiple_teams=True,
    auto_assign_courts=True,
)

DUMMY_STAGE1 = Stage(
    tournament_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    is_active=True,
    name='Group Stage',
)

DUMMY_STAGE2 = Stage(
    tournament_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    is_active=False,
    name='Knockout Stage',
)

DUMMY_STAGE_ITEM1 = StageItemToInsert(
    stage_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name='Group A',
)

DUMMY_STAGE_ITEM2 = StageItemToInsert(
    stage_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    type=StageType.ROUND_ROBIN,
    team_count=4,
    name='Group B',
)

DUMMY_STAGE_ITEM3 = StageItemToInsert(
    stage_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    type=StageType.SINGLE_ELIMINATION,
    team_count=4,
    name='Bracket A',
)

DUMMY_ROUND1 = Round(
    stage_item_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name='Round 1',
)

DUMMY_ROUND2 = Round(
    stage_item_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    is_draft=True,
    name='Round 2',
)

DUMMY_ROUND3 = Round(
    stage_item_id=DB_PLACEHOLDER_ID,
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name='Round 3',
)

DUMMY_MATCH1 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=DB_PLACEHOLDER_ID,
    team1_id=DB_PLACEHOLDER_ID,
    team2_id=2,
    team1_score=11,
    team2_score=22,
    court_id=DB_PLACEHOLDER_ID,
    team1_winner_from_stage_item_id=None,
    team1_winner_position_in_stage_item=None,
    team1_winner_from_match_id=None,
    team2_winner_from_stage_item_id=None,
    team2_winner_position_in_stage_item=None,
    team2_winner_from_match_id=None,
)

DUMMY_MATCH2 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=DB_PLACEHOLDER_ID,
    team1_id=3,
    team2_id=4,
    team1_score=9,
    team2_score=6,
    court_id=DB_PLACEHOLDER_ID,
    team1_winner_from_stage_item_id=None,
    team1_winner_position_in_stage_item=None,
    team1_winner_from_match_id=None,
    team2_winner_from_stage_item_id=None,
    team2_winner_position_in_stage_item=None,
    team2_winner_from_match_id=None,
)

DUMMY_MATCH3 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=2,
    team1_id=DB_PLACEHOLDER_ID,
    team2_id=4,
    team1_score=23,
    team2_score=26,
    court_id=DB_PLACEHOLDER_ID,
    team1_winner_from_stage_item_id=None,
    team1_winner_position_in_stage_item=None,
    team1_winner_from_match_id=None,
    team2_winner_from_stage_item_id=None,
    team2_winner_position_in_stage_item=None,
    team2_winner_from_match_id=None,
)

DUMMY_MATCH4 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=2,
    team1_id=2,
    team2_id=3,
    team1_score=43,
    team2_score=45,
    court_id=None,
    team1_winner_from_stage_item_id=None,
    team1_winner_position_in_stage_item=None,
    team1_winner_from_match_id=None,
    team2_winner_from_stage_item_id=None,
    team2_winner_position_in_stage_item=None,
    team2_winner_from_match_id=None,
)

DUMMY_USER = User(
    email='admin@example.com',
    name='Admin',
    password_hash=pwd_context.hash('adminadmin'),
    created=DUMMY_MOCK_TIME,
)

DUMMY_TEAM1 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 1',
    tournament_id=DB_PLACEHOLDER_ID,
    active=True,
)

DUMMY_TEAM2 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 2',
    tournament_id=DB_PLACEHOLDER_ID,
    active=True,
)

DUMMY_TEAM3 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 3',
    tournament_id=DB_PLACEHOLDER_ID,
    active=True,
)

DUMMY_TEAM4 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 4',
    tournament_id=DB_PLACEHOLDER_ID,
    active=True,
)


DUMMY_PLAYER1 = Player(
    name='Luke',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER2 = Player(
    name='Anakin',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER3 = Player(
    name='Leia',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER4 = Player(
    name='Yoda',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER5 = Player(
    name='Boba',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER6 = Player(
    name='General',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER7 = Player(
    name='Han',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER8 = Player(
    name='Emperor',
    active=True,
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_PLAYER_X_TEAM = PlayerXTeam(
    player_id=DB_PLACEHOLDER_ID,
    team_id=DB_PLACEHOLDER_ID,
)

DUMMY_USER_X_CLUB = UserXClub(
    user_id=DB_PLACEHOLDER_ID,
    club_id=DB_PLACEHOLDER_ID,
)

DUMMY_COURT1 = Court(
    name='Endor',
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)

DUMMY_COURT2 = Court(
    name='Naboo',
    created=DUMMY_MOCK_TIME,
    tournament_id=DB_PLACEHOLDER_ID,
)
