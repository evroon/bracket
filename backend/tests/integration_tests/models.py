from pydantic import BaseModel

from bracket.models.db.club import Club
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import User
from bracket.models.db.user_x_club import UserXClub


class AuthContext(BaseModel):
    club: Club
    tournament: Tournament
    user: User
    user_x_club: UserXClub
    headers: dict[str, str]
