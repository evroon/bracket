from typing import Generic, TypeVar

from pydantic import BaseModel
from pydantic.generics import GenericModel

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


class DataResponse(GenericModel, Generic[DataT]):
    data: DataT


class ClubsResponse(DataResponse[list[Club]]):
    pass


class ClubResponse(DataResponse[Club | None]):
    pass


class TournamentResponse(DataResponse[Tournament]):
    pass


class TournamentsResponse(DataResponse[list[Tournament]]):
    pass


class PlayersResponse(DataResponse[list[Player]]):
    pass


class SinglePlayerResponse(DataResponse[Player]):
    pass


class StagesWithStageItemsResponse(DataResponse[list[StageWithStageItems]]):
    pass


class UpcomingMatchesResponse(DataResponse[list[SuggestedMatch]]):
    pass


class SingleMatchResponse(DataResponse[Match]):
    pass


class TeamsWithPlayersResponse(DataResponse[list[FullTeamWithPlayers]]):
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
