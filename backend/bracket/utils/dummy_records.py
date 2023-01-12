from zoneinfo import ZoneInfo

from heliclockter import datetime_utc

from bracket.models.db.club import Club
from bracket.models.db.match import Match
from bracket.models.db.player import Player
from bracket.models.db.round import Round
from bracket.models.db.team import Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User
from bracket.models.db.user_x_club import UserXClub
from bracket.utils.security import pwd_context

DUMMY_MOCK_TIME = datetime_utc(2022, 1, 11, 4, 32, 11, tzinfo=ZoneInfo('UTC'))

DUMMY_CLUB = Club(
    name='Some Cool Club',
    created=DUMMY_MOCK_TIME,
)

DUMMY_TOURNAMENT = Tournament(
    club_id=1,
    name='Some Cool Tournament',
    created=DUMMY_MOCK_TIME,
    dashboard_public=True,
    logo_path=None,
)

DUMMY_ROUND1 = Round(
    tournament_id=1,
    created=DUMMY_MOCK_TIME,
    is_draft=False,
    name='Round 1',
)

DUMMY_ROUND2 = Round(
    tournament_id=1,
    created=DUMMY_MOCK_TIME,
    is_active=True,
    is_draft=False,
    name='Round 2',
)

DUMMY_ROUND3 = Round(
    tournament_id=1,
    created=DUMMY_MOCK_TIME,
    is_draft=True,
    name='Round 3',
)

DUMMY_MATCH1 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=1,
    team1_id=1,
    team2_id=2,
    team1_score=11,
    team2_score=22,
)

DUMMY_MATCH2 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=1,
    team1_id=3,
    team2_id=4,
    team1_score=9,
    team2_score=6,
)

DUMMY_MATCH3 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=2,
    team1_id=1,
    team2_id=4,
    team1_score=23,
    team2_score=26,
)

DUMMY_MATCH4 = Match(
    created=DUMMY_MOCK_TIME,
    round_id=2,
    team1_id=2,
    team2_id=3,
    team1_score=43,
    team2_score=45,
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
    tournament_id=1,
    active=True,
)

DUMMY_TEAM2 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 2',
    tournament_id=1,
    active=True,
)

DUMMY_TEAM3 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 3',
    tournament_id=1,
    active=True,
)

DUMMY_TEAM4 = Team(
    created=DUMMY_MOCK_TIME,
    name='Team 4',
    tournament_id=1,
    active=True,
)


DUMMY_PLAYER1 = Player(
    name='Luke',
    created=DUMMY_MOCK_TIME,
    team_id=1,
    tournament_id=1,
)

DUMMY_PLAYER2 = Player(
    name='Anakin',
    created=DUMMY_MOCK_TIME,
    team_id=1,
    tournament_id=1,
)

DUMMY_PLAYER3 = Player(
    name='Leia',
    created=DUMMY_MOCK_TIME,
    team_id=2,
    tournament_id=1,
)

DUMMY_PLAYER4 = Player(
    name='Yoda',
    created=DUMMY_MOCK_TIME,
    team_id=2,
    tournament_id=1,
)

DUMMY_PLAYER5 = Player(
    name='Boba',
    created=DUMMY_MOCK_TIME,
    team_id=3,
    tournament_id=1,
)

DUMMY_PLAYER6 = Player(
    name='General',
    created=DUMMY_MOCK_TIME,
    team_id=3,
    tournament_id=1,
)

DUMMY_PLAYER7 = Player(
    name='Han',
    created=DUMMY_MOCK_TIME,
    team_id=4,
    tournament_id=1,
)

DUMMY_PLAYER8 = Player(
    name='Emperor',
    created=DUMMY_MOCK_TIME,
    team_id=4,
    tournament_id=1,
)

DUMMY_PLAYER9 = Player(
    name='R2D2',
    created=DUMMY_MOCK_TIME,
    team_id=None,
    tournament_id=1,
)

DUMMY_USER_X_CLUB = UserXClub(
    user_id=1,
    club_id=1,
)


DUMMY_CLUBS = [DUMMY_CLUB]
DUMMY_TOURNAMENTS = [DUMMY_TOURNAMENT]
DUMMY_ROUNDS = [DUMMY_ROUND1, DUMMY_ROUND2, DUMMY_ROUND3]
DUMMY_MATCHES = [DUMMY_MATCH1, DUMMY_MATCH2, DUMMY_MATCH3, DUMMY_MATCH4]
DUMMY_USERS = [DUMMY_USER]
DUMMY_TEAMS = [DUMMY_TEAM1, DUMMY_TEAM2, DUMMY_TEAM3, DUMMY_TEAM4]
DUMMY_PLAYERS = [
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_PLAYER5,
    DUMMY_PLAYER6,
    DUMMY_PLAYER7,
    DUMMY_PLAYER8,
    DUMMY_PLAYER9,
]
DUMMY_USERS_X_CLUBS = [DUMMY_USER_X_CLUB]
