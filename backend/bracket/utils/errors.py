from collections.abc import Iterator
from contextlib import contextmanager
from enum import auto
from typing import NoReturn

import asyncpg  # type: ignore[import-untyped]
from fastapi import HTTPException
from starlette import status

from bracket.utils.types import EnumAutoStr


class UniqueIndex(EnumAutoStr):
    ix_tournaments_dashboard_endpoint = auto()
    ix_users_email = auto()


class ForeignKey(EnumAutoStr):
    stages_tournament_id_fkey = auto()
    tournaments_club_id_fkey = auto()
    stage_item_inputs_team_id_fkey = auto()
    matches_team1_id_fkey = auto()
    matches_team2_id_fkey = auto()


unique_index_violation_error_lookup = {
    UniqueIndex.ix_tournaments_dashboard_endpoint: "This dashboard link is already taken",
    UniqueIndex.ix_users_email: "This email is already taken",
}


foreign_key_violation_error_lookup = {
    ForeignKey.stages_tournament_id_fkey: "This tournament still has stages, delete those first",
    ForeignKey.tournaments_club_id_fkey: "This club still has tournaments, delete those first",
    ForeignKey.stage_item_inputs_team_id_fkey: "This team is still used in stage items",
    ForeignKey.matches_team1_id_fkey: "This team is still part of matches",
    ForeignKey.matches_team2_id_fkey: "This team is still part of matches",
}


def check_unique_constraint_violation(
    exc: asyncpg.exceptions.UniqueViolationError, expected_violations: set[UniqueIndex]
) -> NoReturn:
    constraint_name = exc.as_dict()["constraint_name"]
    assert constraint_name, "UniqueViolationError occurred but no constraint_name defined"
    assert constraint_name in UniqueIndex.values(), "Unknown UniqueViolationError occurred"
    constraint = UniqueIndex(constraint_name)

    if (
        constraint not in unique_index_violation_error_lookup
        or constraint not in expected_violations
    ):
        raise exc

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=unique_index_violation_error_lookup[constraint],
    )


@contextmanager
def check_foreign_key_violation(expected_violations: set[ForeignKey]) -> Iterator[None]:
    try:
        yield
    except asyncpg.exceptions.ForeignKeyViolationError as exc:
        constraint_name = exc.as_dict()["constraint_name"]
        assert constraint_name, "ForeignKeyViolationError occurred but no constraint_name defined"
        assert (
            constraint_name in ForeignKey.values()
        ), f"Unknown ForeignKeyViolationError occurred: {constraint_name}"
        constraint = ForeignKey(constraint_name)

        if (
            constraint not in foreign_key_violation_error_lookup
            or constraint not in expected_violations
        ):
            raise exc

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=foreign_key_violation_error_lookup[constraint],
        ) from exc
