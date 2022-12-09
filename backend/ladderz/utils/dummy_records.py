from heliclockter import datetime_utc
from passlib.context import CryptContext

from ladderz.models.database import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DUMMY_USER = User(
    username='admin',
    name='Admin',
    password_hash=pwd_context.hash('admin'),
    created=datetime_utc.now(),
)
