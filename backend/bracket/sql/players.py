from bracket.database import database
from bracket.models.db.player import Player


async def get_all_players_in_tournament(tournament_id: int) -> list[Player]:
    query = '''
        SELECT *
        FROM players
        WHERE players.tournament_id = :tournament_id
        '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return [Player.parse_obj(x._mapping) for x in result]


async def get_active_players_in_tournament(tournament_id: int) -> list[Player]:
    query = '''
        SELECT *
        FROM players
        WHERE players.tournament_id = :tournament_id
        AND players.active IS TRUE
        '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return [Player.parse_obj(x._mapping) for x in result]
