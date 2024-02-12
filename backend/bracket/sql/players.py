from decimal import Decimal
from typing import cast

from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.player import Player, PlayerBody, PlayerToInsert
from bracket.models.db.players import START_ELO, PlayerStatistics
from bracket.schema import players
from bracket.utils.pagination import Pagination


async def get_all_players_in_tournament(
    tournament_id: int,
    *,
    not_in_team: bool = False,
    pagination: Pagination | None = None,
) -> list[Player]:
    not_in_team_filter = "AND players.team_id IS NULL" if not_in_team else ""
    limit_filter = "LIMIT :limit" if pagination is not None and pagination.limit is not None else ""
    offset_filter = (
        "OFFSET :offset" if pagination is not None and pagination.offset is not None else ""
    )
    query = f"""
        SELECT *
        FROM players
        WHERE players.tournament_id = :tournament_id
        {not_in_team_filter}
        ORDER BY name
        {limit_filter}
        {offset_filter}
        """

    values = {"tournament_id": tournament_id}
    if pagination is not None:
        values["offset"] = pagination.offset if pagination is not None else None
        values["limit"] = pagination.limit if pagination is not None else None

    result = await database.fetch_all(query=query, values=values)
    return [Player.model_validate(x) for x in result]


async def get_player_count(
    tournament_id: int,
    *,
    not_in_team: bool = False,
) -> int:
    not_in_team_filter = "AND players.team_id IS NULL" if not_in_team else ""
    query = f"""
        SELECT count(*)
        FROM players
        WHERE players.tournament_id = :tournament_id
        {not_in_team_filter}
        """
    return cast(int, await database.fetch_val(query=query, values={"tournament_id": tournament_id}))


async def update_player_stats(
    tournament_id: int, player_id: int, player_statistics: PlayerStatistics
) -> None:
    query = """
        UPDATE players
        SET
            wins = :wins,
            draws = :draws,
            losses = :losses,
            elo_score = :elo_score,
            swiss_score = :swiss_score
        WHERE players.tournament_id = :tournament_id
        AND players.id = :player_id
        """
    await database.execute(
        query=query,
        values={
            "tournament_id": tournament_id,
            "player_id": player_id,
            "wins": player_statistics.wins,
            "draws": player_statistics.draws,
            "losses": player_statistics.losses,
            "elo_score": player_statistics.elo_score,
            "swiss_score": float(player_statistics.swiss_score),
        },
    )


async def sql_delete_player(tournament_id: int, player_id: int) -> None:
    query = "DELETE FROM players WHERE id = :player_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"player_id": player_id, "tournament_id": tournament_id}
    )


async def sql_delete_players_of_tournament(tournament_id: int) -> None:
    query = "DELETE FROM players WHERE tournament_id = :tournament_id"
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})


async def insert_player(player_body: PlayerBody, tournament_id: int) -> None:
    await database.execute(
        query=players.insert(),
        values=PlayerToInsert(
            **player_body.model_dump(),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
            elo_score=Decimal(START_ELO),
            swiss_score=Decimal("0.0"),
        ).model_dump(),
    )
