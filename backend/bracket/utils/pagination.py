from dataclasses import dataclass
from typing import Literal

from fastapi import Query


@dataclass
class Pagination:
    limit: int = Query(25, ge=1, le=100, description="Max number of results in a single page.")
    offset: int = Query(0, ge=0, description="Filter results starting from this offset.")
    sort_direction: Literal["asc", "desc"] = "asc"


@dataclass
class PaginationPlayers(Pagination):
    sort_by: Literal[
        "name", "elo_score", "swiss_score", "wins", "draws", "losses", "active", "created"
    ] = "name"


@dataclass
class PaginationTeams(Pagination):
    sort_by: Literal[
        "name", "elo_score", "swiss_score", "wins", "draws", "losses", "active", "created"
    ] = "name"
