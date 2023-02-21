from bracket.database import database
from bracket.models.db.round import RoundWithMatches
from bracket.utils.types import dict_without_none


async def get_rounds_with_matches(
    tournament_id: int,
    no_draft_rounds: bool = False,
    round_id: int | None = None,
) -> list[RoundWithMatches]:
    draft_filter = 'AND rounds.is_draft IS FALSE' if no_draft_rounds else ''
    round_filter = 'AND rounds.id = :round_id' if round_id is not None else ''
    query = f'''
        WITH teams_with_players AS (
            SELECT DISTINCT ON (teams.id)
                teams.*,
                to_json(array_remove(array_agg(p), NULL)) as players
            FROM teams
            LEFT JOIN players_x_teams pt on pt.team_id = teams.id
            LEFT JOIN players p on pt.player_id = p.id
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
        {draft_filter}
        {round_filter}
        GROUP BY rounds.id
    '''
    values = dict_without_none({'tournament_id': tournament_id, 'round_id': round_id})
    result = await database.fetch_all(query=query, values=values)
    return [RoundWithMatches.parse_obj(x._mapping) for x in result]


async def get_next_round_name(tournament_id: int) -> str:
    query = '''
        SELECT count(*) FROM rounds
        WHERE rounds.tournament_id = :tournament_id
    '''
    round_count = int(
        await database.fetch_val(query=query, values={'tournament_id': tournament_id})
    )
    return f'Round {round_count + 1}'
