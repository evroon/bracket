from bracket.database import database
from bracket.models.db.players import PlayerStatistics
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.utils.types import dict_without_none


async def get_team_by_id(team_id: int, tournament_id: int) -> Team | None:
    query = """
        SELECT *
        FROM teams
        WHERE id = :team_id
        AND tournament_id = :tournament_id
    """
    result = await database.fetch_one(
        query=query, values={"team_id": team_id, "tournament_id": tournament_id}
    )
    return Team.parse_obj(result._mapping) if result is not None else None


async def get_teams_with_members(
    tournament_id: int, *, only_active_teams: bool = False, team_id: int | None = None
) -> list[FullTeamWithPlayers]:
    active_team_filter = "AND teams.active IS TRUE" if only_active_teams else ""
    team_id_filter = "AND teams.id = :team_id" if team_id is not None else ""
    query = f"""
        SELECT
            teams.*,
            to_json(array_agg(p.*)) AS players
        FROM teams
        LEFT JOIN players_x_teams pt on pt.team_id = teams.id
        LEFT JOIN players p on pt.player_id = p.id
        WHERE teams.tournament_id = :tournament_id
        {active_team_filter}
        {team_id_filter}
        GROUP BY teams.id
        ORDER BY teams.elo_score DESC, teams.wins DESC, name ASC
        """
    values = dict_without_none({"tournament_id": tournament_id, "team_id": team_id})
    result = await database.fetch_all(query=query, values=values)
    return [FullTeamWithPlayers.parse_obj(x._mapping) for x in result]


async def update_team_stats(
    tournament_id: int, team_id: int, team_statistics: PlayerStatistics
) -> None:
    query = """
        UPDATE teams
        SET
            wins = :wins,
            draws = :draws,
            losses = :losses,
            elo_score = :elo_score,
            swiss_score = :swiss_score
        WHERE teams.tournament_id = :tournament_id
        AND teams.id = :team_id
        """
    await database.execute(
        query=query,
        values={
            "tournament_id": tournament_id,
            "team_id": team_id,
            "wins": team_statistics.wins,
            "draws": team_statistics.draws,
            "losses": team_statistics.losses,
            "elo_score": team_statistics.elo_score,
            "swiss_score": float(team_statistics.swiss_score),
        },
    )


async def sql_delete_team(tournament_id: int, team_id: int) -> None:
    query = "DELETE FROM teams WHERE id = :team_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"team_id": team_id, "tournament_id": tournament_id}
    )


async def sql_delete_teams_of_tournament(tournament_id: int) -> None:
    query = "DELETE FROM teams WHERE tournament_id = :tournament_id"
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})
