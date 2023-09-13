from bracket.database import database
from bracket.models.db.court import Court, CourtBody


async def get_all_courts_in_tournament(tournament_id: int) -> list[Court]:
    query = '''
        SELECT *
        FROM courts
        WHERE courts.tournament_id = :tournament_id
        '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return [Court.parse_obj(x._mapping) for x in result]


async def get_all_free_courts_in_round(tournament_id: int, round_id: int) -> list[Court]:
    query = '''
        SELECT *
        FROM courts
        WHERE NOT EXISTS (
            SELECT 1
            FROM matches
            WHERE matches.court_id = courts.id
            AND matches.round_id = :round_id
        )
        AND courts.tournament_id = :tournament_id
        ORDER BY courts.name
        '''
    result = await database.fetch_all(
        query=query, values={'tournament_id': tournament_id, 'round_id': round_id}
    )
    return [Court.parse_obj(x._mapping) for x in result]


async def update_court(tournament_id: int, court_id: int, court_body: CourtBody) -> list[Court]:
    query = '''
        UPDATE courts
        SET name = :name
        WHERE courts.tournament_id = :tournament_id
        AND courts.id = :court_id
        '''
    result = await database.fetch_all(
        query=query,
        values={'tournament_id': tournament_id, 'court_id': court_id, 'name': court_body.name},
    )
    return [Court.parse_obj(x._mapping) for x in result]
