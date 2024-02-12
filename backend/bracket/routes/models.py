from typing import Generic, TypeVar

from pydantic import BaseModel

from bracket.models.db.club import Club
from bracket.models.db.court import Court
from bracket.models.db.match import Match, SuggestedMatch
from bracket.models.db.player import Player
from bracket.models.db.stage_item_inputs import (
    StageItemInputOptionFinal,
    StageItemInputOptionTentative,
)
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.models.db.tournament import Tournament
from bracket.models.db.user import UserPublic
from bracket.models.db.util import StageWithStageItems
from bracket.routes.auth import Token

DataT = TypeVar("DataT")


class SuccessResponse(BaseModel):
    success: bool = True


class DataResponse(BaseModel, Generic[DataT]):
    data: DataT


class ClubsResponse(DataResponse[list[Club]]):
    pass


class ClubResponse(DataResponse[Club | None]):
    pass


class TournamentResponse(DataResponse[Tournament]):
    pass


class TournamentsResponse(DataResponse[list[Tournament]]):
    pass


class PaginatedPlayers(BaseModel):
    count: int
    players: list[Player]


class PlayersResponse(DataResponse[PaginatedPlayers]):
    pass


class SinglePlayerResponse(DataResponse[Player]):
    pass


class StagesWithStageItemsResponse(DataResponse[list[StageWithStageItems]]):
    pass


class UpcomingMatchesResponse(DataResponse[list[SuggestedMatch]]):
    pass


class SingleMatchResponse(DataResponse[Match]):
    pass


class PaginatedTeams(BaseModel):
    count: int
    teams: list[FullTeamWithPlayers]


class TeamsWithPlayersResponse(DataResponse[PaginatedTeams]):
    pass


class SingleTeamResponse(DataResponse[Team]):
    pass


class UserPublicResponse(DataResponse[UserPublic]):
    pass


class TokenResponse(DataResponse[Token]):
    pass


class CourtsResponse(DataResponse[list[Court]]):
    pass


class SingleCourtResponse(DataResponse[Court]):
    pass


class StageItemInputOptionsResponse(
    DataResponse[list[StageItemInputOptionTentative | StageItemInputOptionFinal]]
):
    pass
