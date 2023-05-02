from bracket.database import database
from bracket.models.db.match import Match, MatchCreateBody


async def sql_delete_match(match_id: int) -> None:
    query = '''
        DELETE FROM matches
        WHERE matches.id = :match_id
        '''
    await database.execute(query=query, values={'match_id': match_id})


async def sql_create_match(match: MatchCreateBody) -> Match:
    async with database.transaction():
        query = '''
            INSERT INTO matches (round_id, team1_id, team2_id, team1_score, team2_score, label, created)
            VALUES (:round_id, :team1_id, :team2_id, 0, 0, :label, NOW())
            RETURNING *
            '''
        result = await database.fetch_one(query=query, values=match.dict())

    if result is None:
        raise ValueError('Could not create stage')

    return Match.parse_obj(result._mapping)
