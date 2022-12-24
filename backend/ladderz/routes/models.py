from typing import Generic, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel

from ladderz.models.db.club import Club
from ladderz.models.db.match import Match
from ladderz.models.db.player import Player
from ladderz.models.db.round import Round, RoundWithMatches
from ladderz.models.db.team import Team, TeamWithPlayers
from ladderz.models.db.tournament import Tournament

DataT = TypeVar('DataT')


class SuccessResponse(BaseModel):
    success: bool = True


class DataResponse(GenericModel, Generic[DataT]):
    data: DataT


class ClubsResponse(DataResponse[list[Club]]):
    pass


class TournamentsResponse(DataResponse[list[Tournament]]):
    pass


class PlayersResponse(DataResponse[list[Player]]):
    pass


class SinglePlayerResponse(DataResponse[Player]):
    pass


class RoundsResponse(DataResponse[list[Round]]):
    pass


class RoundsWithMatchesResponse(DataResponse[list[RoundWithMatches]]):
    pass


class UpcomingMatchesResponse(DataResponse[list[Match]]):
    pass


class TeamsResponse(DataResponse[list[Team]]):
    pass


class TeamsWithPlayersResponse(DataResponse[list[TeamWithPlayers]]):
    pass


class SingleTeamResponse(DataResponse[Team]):
    pass
