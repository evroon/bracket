from databases import Database

from bracket.database import database
from bracket.models.db.round import RoundWithMatches
from bracket.models.db.team import TeamWithPlayers
from bracket.routes.models import RoundsWithMatchesResponse, TeamsWithPlayersResponse


async def get_rounds_with_matches(tournament_id: int) -> RoundsWithMatchesResponse:
    query = '''
        WITH teams_with_players AS (
            SELECT DISTINCT ON (teams.id)
                teams.*,
                to_json(array_agg(p)) as players
            FROM teams
            LEFT JOIN players p on p.team_id = teams.id
            WHERE teams.tournament_id = :tournament_id
            GROUP BY teams.id
        ), matches_with_teams AS (
            SELECT DISTINCT ON (matches.id)
                matches.*,
                to_json(t1) as team1,
                to_json(t2) as team2
            FROM matches
            LEFT JOIN teams_with_players t1 on t1.id = matches.team1_id
            LEFT JOIN teams_with_players t2 on t2.id = matches.team2_id
            LEFT JOIN rounds r on matches.round_id = r.id
            WHERE r.tournament_id = :tournament_id
        )
        SELECT rounds.*, to_json(array_agg(m.*)) AS matches FROM rounds
        LEFT JOIN matches_with_teams m on rounds.id = m.round_id
        WHERE rounds.tournament_id = :tournament_id
        GROUP BY rounds.id
    '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return RoundsWithMatchesResponse.parse_obj(
        {'data': [RoundWithMatches.parse_obj(x._mapping) for x in result]}
    )


async def get_next_round_name(database: Database, tournament_id: int) -> str:
    query = '''
        SELECT count(*) FROM rounds
        WHERE rounds.tournament_id = :tournament_id
    '''
    round_count = int(
        await database.fetch_val(query=query, values={'tournament_id': tournament_id})
    )
    return f'Round {round_count + 1}'


async def get_teams_with_members(tournament_id: int) -> TeamsWithPlayersResponse:
    query = '''
        SELECT teams.*, to_json(array_agg(players.*)) AS players
        FROM teams
        LEFT JOIN players ON players.team_id = teams.id
        WHERE teams.tournament_id = :tournament_id
        GROUP BY teams.id;
        '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return TeamsWithPlayersResponse.parse_obj(
        {'data': [TeamWithPlayers.parse_obj(x._mapping) for x in result]}
    )
