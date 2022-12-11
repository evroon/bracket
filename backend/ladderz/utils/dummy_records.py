from heliclockter import datetime_utc
from passlib.context import CryptContext

from ladderz.models.db.player import Player
from ladderz.models.db.tournament import Tournament
from ladderz.models.db.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DUMMY_USER = User(
    username='admin',
    name='Admin',
    password_hash=pwd_context.hash('admin'),
    created=datetime_utc.now(),
)

DUMMY_TOURNAMENT = Tournament(
    name='Some Cool Tournament',
    created=datetime_utc.now(),
)


DUMMY_PLAYER = Player(
    name='Some Cool Player',
    created=datetime_utc.now(),
)
