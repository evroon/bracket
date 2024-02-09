from decimal import Decimal

from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.player import Player, PlayerBody, PlayerToInsert
from bracket.models.db.players import START_ELO, PlayerStatistics
from bracket.schema import players


async def get_all_players_in_tournament(
    tournament_id: int, *, not_in_team: bool = False
) -> list[Player]:
    query = """
        SELECT *
        FROM players
        WHERE players.tournament_id = :tournament_id
        """
    if not_in_team:
        query += "AND players.team_id IS NULL"

    result = await database.fetch_all(query=query, values={"tournament_id": tournament_id})
    return [Player.model_validate(dict(x._mapping)) for x in result]


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
