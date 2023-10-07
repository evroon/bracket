from bracket.database import database
from bracket.models.db.match import Match, MatchBody, MatchCreateBody


async def sql_delete_match(match_id: int) -> None:
    query = '''
        DELETE FROM matches
        WHERE matches.id = :match_id
        '''
    await database.execute(query=query, values={'match_id': match_id})


async def sql_create_match(match: MatchCreateBody) -> Match:
    query = '''
        INSERT INTO matches (
            round_id,
            team1_id,
            team2_id,
            team1_score,
            team2_score,
            court_id,
            created
        )
        VALUES (:round_id, :team1_id, :team2_id, 0, 0, :court_id, NOW())
        RETURNING *
        '''
    result = await database.fetch_one(query=query, values=match.dict())

    if result is None:
        raise ValueError('Could not create stage')

    return Match.parse_obj(result._mapping)


async def sql_update_match(match_id: int, match: MatchBody) -> None:
    query = '''
        UPDATE matches
        SET round_id = :round_id,
            team1_score = :team1_score,
            team2_score = :team2_score,
            court_id = :court_id
        WHERE matches.id = :match_id
        RETURNING *
        '''
    await database.execute(query=query, values={'match_id': match_id, **match.dict()})
