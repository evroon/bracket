from typing import Any

from bracket.database import database
from bracket.models.db.tournament import Tournament


async def sql_get_tournament(tournament_id: int) -> Tournament:
    query = '''
        SELECT *
        FROM tournaments
        WHERE id = :tournament_id
        '''
    result = await database.fetch_one(query=query, values={'tournament_id': tournament_id})
    assert result is not None
    return Tournament.parse_obj(result._mapping)


async def sql_get_tournament_by_endpoint_name(endpoint_name: str) -> Tournament:
    query = '''
        SELECT *
        FROM tournaments
        WHERE dashboard_endpoint = :endpoint_name
        AND dashboard_public IS TRUE
        '''
    result = await database.fetch_one(query=query, values={'endpoint_name': endpoint_name})
    assert result is not None
    return Tournament.parse_obj(result._mapping)


async def sql_get_tournaments(
    club_ids: tuple[int, ...], endpoint_name: str | None
) -> list[Tournament]:
    query = '''
        SELECT *
        FROM tournaments
        WHERE club_id = any(:club_ids)
        '''

    params: dict[str, Any] = {'club_ids': club_ids}

    if endpoint_name is not None:
        query += 'AND dashboard_endpoint = :endpoint_name'
        params = {**params, 'endpoint_name': endpoint_name}

    result = await database.fetch_all(query=query, values=params)
    return [Tournament.parse_obj(x._mapping) for x in result]
