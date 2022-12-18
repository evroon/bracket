from heliclockter import datetime_utc
from passlib.context import CryptContext

from ladderz.models.db.club import Club
from ladderz.models.db.match import Match
from ladderz.models.db.player import Player
from ladderz.models.db.round import Round
from ladderz.models.db.team import Team
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DUMMY_CLUB = Club(
    name='Some Cool Club',
    created=datetime_utc.now(),
)

DUMMY_TOURNAMENT = Tournament(
    club_id=1,
    name='Some Cool Tournament',
    created=datetime_utc.now(),
)

DUMMY_ROUND1 = Round(
    tournament_id=1,
    created=datetime_utc.now(),
    is_draft=False,
    round_index=1,
)

DUMMY_ROUND2 = Round(
    tournament_id=1,
    created=datetime_utc.now(),
    is_draft=False,
    round_index=1,
)

DUMMY_MATCH1 = Match(
    created=datetime_utc.now(),
    round_id=1,
    team1=1,
    team2=2,
)

DUMMY_USER = User(
    username='admin',
    name='Admin',
    password_hash=pwd_context.hash('admin'),
    created=datetime_utc.now(),
)

DUMMY_TEAM1 = Team(
    created=datetime_utc.now(),
    name='Team 1',
    tournament_id=1,
    active=True,
)

DUMMY_TEAM2 = Team(
    created=datetime_utc.now(),
    name='Team 2',
    tournament_id=1,
    active=True,
)


DUMMY_PLAYER1 = Player(
    name='Luke',
    created=datetime_utc.now(),
    team_id=1,
    tournament_id=1,
)

DUMMY_PLAYER2 = Player(
    name='Anakin',
    created=datetime_utc.now(),
    team_id=1,
    tournament_id=1,
)

DUMMY_PLAYER3 = Player(
    name='Leia',
    created=datetime_utc.now(),
    team_id=2,
    tournament_id=1,
)

DUMMY_PLAYER4 = Player(
    name='Yoda',
    created=datetime_utc.now(),
    team_id=2,
    tournament_id=1,
)

DUMMY_PLAYER5 = Player(
    name='Boba',
    created=datetime_utc.now(),
    team_id=None,
    tournament_id=1,
)

DUMMY_PLAYER6 = Player(
    name='General',
    created=datetime_utc.now(),
    team_id=None,
    tournament_id=1,
)


DUMMY_CLUBS = [DUMMY_CLUB]
DUMMY_TOURNAMENTS = [DUMMY_TOURNAMENT]
DUMMY_ROUNDS = [DUMMY_ROUND1, DUMMY_ROUND2]
DUMMY_MATCHES = [DUMMY_MATCH1]
DUMMY_USERS = [DUMMY_USER]
DUMMY_TEAMS = [DUMMY_TEAM1, DUMMY_TEAM2]
DUMMY_PLAYERS = [
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_PLAYER5,
    DUMMY_PLAYER6,
]
