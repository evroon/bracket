from bracket.database import database
from bracket.models.db.player import Player
from bracket.models.db.players import PlayerStatistics


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


async def update_player_stats(
    tournament_id: int, player_id: int, player_statistics: PlayerStatistics
) -> None:
    query = '''
        UPDATE players
        SET
            wins = :wins,
            draws = :draws,
            losses = :losses,
            elo_score = :elo_score,
            swiss_score = :swiss_score
        WHERE players.tournament_id = :tournament_id
        AND players.id = :player_id
        '''
    await database.execute(
        query=query,
        values={
            'tournament_id': tournament_id,
            'player_id': player_id,
            'wins': player_statistics.wins,
            'draws': player_statistics.draws,
            'losses': player_statistics.losses,
            'elo_score': player_statistics.elo_score,
            'swiss_score': float(player_statistics.swiss_score),
        },
    )
