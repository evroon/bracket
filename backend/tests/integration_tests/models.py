from pydantic import BaseModel

from bracket.models.db.club import Club
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User


class AuthContext(BaseModel):
    club: Club
    tournament: Tournament
    user: User
    headers: dict[str, str]
