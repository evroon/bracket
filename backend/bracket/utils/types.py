from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, Any, NewType

if TYPE_CHECKING:
    from collections.abc import Sequence

JsonDict = dict[str, Any]
JsonList = list[Any]
JsonObject = JsonDict | JsonList

ELO = NewType("ELO", int)


class EnumValues(Enum):
    @classmethod
    def values(cls) -> list[str]:
        return [x.value for x in cls]


class EnumAutoStr(EnumValues):
    @staticmethod
    def _generate_next_value_(  # pylint: disable=arguments-differ # pyrefly: ignore [bad-override]
        name: str, start: int, count: int, last_values: Sequence[str]
    ) -> str:
        return name


def assert_some[T](result: T | None) -> T:
    assert result is not None
    return result


def dict_without_none(input_: dict[Any, Any]) -> dict[Any, Any]:
    return {k: v for k, v in input_.items() if v is not None}
