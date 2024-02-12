from dataclasses import dataclass

from fastapi import Query


@dataclass
class Limit:
    limit: int = Query(25, ge=1, le=100, description="Max number of results in a single page.")


@dataclass
class Pagination(Limit):
    offset: int = Query(0, ge=0, description="Filter results starting from this offset.")
