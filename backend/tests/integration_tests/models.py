from pydantic import BaseModel

from bracket.models.db.club import Club
from bracket.models.db.ranking import Ranking
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserInDB
from bracket.models.db.user_x_club import UserXClub


class AuthContext(BaseModel):
    club: Club
    tournament: Tournament
    user: UserInDB
    user_x_club: UserXClub
    headers: dict[str, str]
    ranking: Ranking
