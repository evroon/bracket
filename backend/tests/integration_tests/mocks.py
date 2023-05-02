from uuid import uuid4
from zoneinfo import ZoneInfo

from heliclockter import datetime_utc, timedelta

from bracket.models.db.user import User
from bracket.routes.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token

MOCK_NOW = datetime_utc(
    year=2200, month=1, day=1, hour=0, minute=0, microsecond=0, second=0, tzinfo=ZoneInfo('UTC')
)

MOCK_USER = User(
    email=f'donald_duck{uuid4()}',
    name='Donald Duck',
    # hash of 'mypassword'
    password_hash='$2b$12$.LcTJuoOtwU4CfK8UgEtIu5BRmTdvZv6IH.6IvGshDCgwJsvOMLeu',
    created=MOCK_NOW,
)


def get_mock_token() -> str:
    return create_access_token(
        data={"user": MOCK_USER.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
