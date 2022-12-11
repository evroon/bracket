from typing import Generic, TypeVar

from pydantic.generics import GenericModel

from ladderz.models.db.tournament import Tournament

DataT = TypeVar('DataT')


class DataResponse(GenericModel, Generic[DataT]):
    data: DataT


class TournamentsResponse(DataResponse[list[Tournament]]):
    pass


class PlayersResponse(DataResponse[list[Tournament]]):
    pass
