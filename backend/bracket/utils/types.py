from __future__ import annotations

from enum import Enum
from typing import Any, NewType, Sequence, TypeVar

from pydantic import BaseModel

BaseModelT = TypeVar('BaseModelT', bound=BaseModel)
T = TypeVar('T')
JsonDict = dict[str, Any]
JsonList = list[Any]
JsonObject = JsonDict | JsonList

ELO = NewType('ELO', int)


class EnumValues(Enum):
    @classmethod
    def values(cls) -> list[str]:
        return [x.value for x in cls]


class EnumAutoStr(EnumValues):
    @staticmethod
    def _generate_next_value_(  # pylint: disable=arguments-differ
        name: str, start: int, count: int, last_values: Sequence[str]
    ) -> str:
        return name


def assert_some(result: T | None) -> T:
    assert result is not None
    return result
