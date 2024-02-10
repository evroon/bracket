from enum import auto
from typing import NoReturn

import asyncpg  # type: ignore[import-untyped]
from fastapi import HTTPException
from starlette import status

from bracket.utils.types import EnumAutoStr


class UniqueIndex(EnumAutoStr):
    ix_tournaments_dashboard_endpoint = auto()
    ix_users_email = auto()


unique_index_violation_error_lookup = {
    UniqueIndex.ix_tournaments_dashboard_endpoint: "This dashboard link is already taken",
    UniqueIndex.ix_users_email: "This email is already taken",
}


def check_constraint_and_raise_http_exception(
    exc: asyncpg.exceptions.UniqueViolationError,
) -> NoReturn:
    constraint_name = exc.as_dict()["constraint_name"]
    assert constraint_name, "UniqueViolationError occurred but no constraint_name defined"

    if constraint_name in unique_index_violation_error_lookup:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=unique_index_violation_error_lookup[constraint_name],
        )

    raise exc
