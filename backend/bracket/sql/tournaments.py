from typing import Any

from bracket.database import database
from bracket.logic.tournaments import delete_tournament_logo
from bracket.models.db.tournament import Tournament
from bracket.sql.courts import sql_delete_courts_of_tournament
from bracket.sql.players import sql_delete_players_of_tournament
from bracket.sql.shared import (
    sql_delete_stage_item_relations,
)
from bracket.sql.stage_items import sql_delete_stage_item
from bracket.sql.stages import get_full_tournament_details, sql_delete_stage
from bracket.sql.teams import (
    sql_delete_teams_of_tournament,
)
from bracket.utils.types import assert_some


async def sql_get_tournament(tournament_id: int) -> Tournament:
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


async def sql_delete_tournament(tournament_id: int) -> None:
    query = """
        DELETE FROM tournaments
        WHERE id = :tournament_id
        """
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})


async def sql_delete_tournament_completely(tournament_id: int) -> None:
    stages = await get_full_tournament_details(tournament_id)
    await delete_tournament_logo(tournament_id)

    for stage in stages:
        for stage_item in stage.stage_items:
            await sql_delete_stage_item_relations(stage_item.id)

    for stage in stages:
        for stage_item in stage.stage_items:
            await sql_delete_stage_item(stage_item.id)

        await sql_delete_stage(tournament_id, assert_some(stage.id))

    await sql_delete_players_of_tournament(tournament_id)
    await sql_delete_courts_of_tournament(tournament_id)
    await sql_delete_teams_of_tournament(tournament_id)
    await sql_delete_tournament(tournament_id)
