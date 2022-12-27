from zoneinfo import ZoneInfo

from heliclockter import datetime_utc

from bracket.models.db.user import User

MOCK_NOW = datetime_utc(
    year=2200, month=1, day=1, hour=0, minute=0, microsecond=0, second=0, tzinfo=ZoneInfo('UTC')
)


MOCK_USER = User(
    email='donald_duck',
    name='Donald Duck',
    # hash of 'mypassword'
    password_hash='$2b$12$.LcTJuoOtwU4CfK8UgEtIu5BRmTdvZv6IH.6IvGshDCgwJsvOMLeu',
    created=MOCK_NOW,
)
