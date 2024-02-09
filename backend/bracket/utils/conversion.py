from collections.abc import Mapping
from typing import Any

from heliclockter import datetime_tz
from pydantic import BaseModel

from bracket.utils.types import EnumAutoStr


def _map_to_str(value: Any) -> Any:
    match value:
        case EnumAutoStr():
            return value.value
        case datetime_tz():
            return value.isoformat()
    return value


def to_string_mapping(obj: BaseModel) -> Mapping[str, Any]:
    """
    Turns a pydantic object into a string mapping to be used as database query
    """
    return {key: _map_to_str(value) for key, value in obj.model_dump(exclude_none=True).items()}
