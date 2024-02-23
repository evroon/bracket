from decimal import Decimal
from typing import cast

from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.player import Player, PlayerBody, PlayerToInsert
from bracket.models.db.players import START_ELO, PlayerStatistics
from bracket.schema import players
from bracket.utils.id_types import PlayerId, TournamentId
from bracket.utils.pagination import PaginationPlayers
from bracket.utils.types import dict_without_none


async def get_all_players_in_tournament(
    tournament_id: TournamentId,
    *,
    not_in_team: bool = False,
    pagination: PaginationPlayers | None = None,
) -> list[Player]:
    not_in_team_filter = "AND players.team_id IS NULL" if not_in_team else ""
    limit_filter = "LIMIT :limit" if pagination is not None and pagination.limit is not None else ""
    offset_filter = (
        "OFFSET :offset" if pagination is not None and pagination.offset is not None else ""
    )
    sort_by = pagination.sort_by if pagination is not None else "name"
    sort_direction = pagination.sort_direction if pagination is not None else ""
    query = f"""
        SELECT *
        FROM players
        WHERE players.tournament_id = :tournament_id
        {not_in_team_filter}
        ORDER BY {sort_by} {sort_direction}
        {limit_filter}
        {offset_filter}
        """

    result = await database.fetch_all(
        query=query,
        values=dict_without_none(
            {
                "tournament_id": tournament_id,
                "offset": pagination.offset if pagination is not None else None,
                "limit": pagination.limit if pagination is not None else None,
            }
        ),
    )

    return [Player.model_validate(x) for x in result]


async def get_player_by_id(player_id: PlayerId, tournament_id: TournamentId) -> Player | None:
    query = """
        SELECT *
        FROM players
        WHERE id = :player_id
        AND tournament_id = :tournament_id
    """
    result = await database.fetch_one(
        query=query, values={"player_id": player_id, "tournament_id": tournament_id}
    )
    return Player.model_validate(result) if result is not None else None


async def get_player_count(
    tournament_id: TournamentId,
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
    tournament_id: TournamentId, player_id: PlayerId, player_statistics: PlayerStatistics
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


async def sql_delete_player(tournament_id: TournamentId, player_id: PlayerId) -> None:
    query = "DELETE FROM players WHERE id = :player_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"player_id": player_id, "tournament_id": tournament_id}
    )


async def sql_delete_players_of_tournament(tournament_id: TournamentId) -> None:
    query = "DELETE FROM players WHERE tournament_id = :tournament_id"
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})


async def insert_player(player_body: PlayerBody, tournament_id: TournamentId) -> None:
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
