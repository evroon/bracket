from bracket.database import database
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.utils.types import dict_without_none


async def get_team_by_id(team_id: int, tournament_id: int) -> Team | None:
    query = '''
        SELECT *
        FROM teams
        WHERE id = :team_id
        AND tournament_id = :tournament_id
    '''
    result = await database.fetch_one(
        query=query, values={'team_id': team_id, 'tournament_id': tournament_id}
    )
    return Team.parse_obj(result._mapping) if result is not None else None


async def get_teams_with_members(
    tournament_id: int, *, only_active_teams: bool = False, team_id: int | None = None
) -> list[FullTeamWithPlayers]:
    active_team_filter = 'AND teams.active IS TRUE' if only_active_teams else ''
    team_id_filter = 'AND teams.id = :team_id' if team_id is not None else ''
    query = f'''
        SELECT teams.*, to_json(array_agg(p.*)) AS players
        FROM teams
        LEFT JOIN players_x_teams pt on pt.team_id = teams.id
        LEFT JOIN players p on pt.player_id = p.id
        WHERE teams.tournament_id = :tournament_id
        {active_team_filter}
        {team_id_filter}
        GROUP BY teams.id;
        '''
    values = dict_without_none({'tournament_id': tournament_id, 'team_id': team_id})
    result = await database.fetch_all(query=query, values=values)
    return [FullTeamWithPlayers.parse_obj(x._mapping) for x in result]
