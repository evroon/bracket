from typing import Any

from bracket.database import database
from bracket.models.db.tournament import Tournament, TournamentUpdateBody
from bracket.utils.id_types import TournamentId


async def sql_get_tournament(tournament_id: TournamentId) -> Tournament:
    query = """
        SELECT *
        FROM tournaments
        WHERE id = :tournament_id
        """
    result = await database.fetch_one(query=query, values={"tournament_id": tournament_id})
    assert result is not None
    return Tournament.model_validate(result)


async def sql_get_tournament_by_endpoint_name(endpoint_name: str) -> Tournament | None:
    query = """
        SELECT *
        FROM tournaments
        WHERE dashboard_endpoint = :endpoint_name
        AND dashboard_public IS TRUE
        """
    result = await database.fetch_one(query=query, values={"endpoint_name": endpoint_name})
    return Tournament.model_validate(result) if result is not None else None


async def sql_get_tournaments(
    club_ids: tuple[int, ...], endpoint_name: str | None = None
) -> list[Tournament]:
    query = """
        SELECT *
        FROM tournaments
        WHERE club_id = any(:club_ids)
        """

    params: dict[str, Any] = {"club_ids": club_ids}

    if endpoint_name is not None:
        query += "AND dashboard_endpoint = :endpoint_name"
        params = {**params, "endpoint_name": endpoint_name}

    result = await database.fetch_all(query=query, values=params)
    return [Tournament.model_validate(x) for x in result]


async def sql_delete_tournament(tournament_id: TournamentId) -> None:
    query = """
        DELETE FROM tournaments
        WHERE id = :tournament_id
        """
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})


async def sql_update_tournament(
    tournament_id: TournamentId, tournament: TournamentUpdateBody
) -> None:
    query = """
        UPDATE tournaments
        SET
            start_time = :start_time,
            name = :name,
            dashboard_public = :dashboard_public,
            dashboard_endpoint = :dashboard_endpoint,
            players_can_be_in_multiple_teams = :players_can_be_in_multiple_teams,
            auto_assign_courts = :auto_assign_courts,
            duration_minutes = :duration_minutes,
            margin_minutes = :margin_minutes
        WHERE tournaments.id = :tournament_id
        """
    await database.execute(
        query=query,
        values={"tournament_id": tournament_id, **tournament.model_dump()},
    )
