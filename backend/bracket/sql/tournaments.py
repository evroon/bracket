from bracket.database import database
from bracket.models.db.tournament import Tournament
from bracket.schema import tournaments
from bracket.utils.db import fetch_one_parsed_certain


async def sql_get_tournament(tournament_id: int) -> Tournament:
    return await fetch_one_parsed_certain(
        database, Tournament, tournaments.select().where(tournaments.c.id == tournament_id)
    )
