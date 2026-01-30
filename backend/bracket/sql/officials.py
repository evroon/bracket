from bracket.database import database
from bracket.models.db.official import Official, OfficialBody
from bracket.utils.id_types import OfficialId, TournamentId


async def get_all_officials_in_tournament(tournament_id: TournamentId) -> list[Official]:
    query = """
        SELECT *
        FROM officials
        WHERE officials.tournament_id = :tournament_id
        ORDER BY name
        """
    result = await database.fetch_all(query=query, values={"tournament_id": tournament_id})
    return [Official.model_validate(dict(x._mapping)) for x in result]


async def get_official_by_access_code(access_code: str) -> Official | None:
    query = """
        SELECT *
        FROM officials
        WHERE officials.access_code = :access_code
        """
    result = await database.fetch_one(query=query, values={"access_code": access_code})
    if result is None:
        return None
    return Official.model_validate(dict(result._mapping))


async def update_official(
    tournament_id: TournamentId, official_id: OfficialId, official_body: OfficialBody
) -> None:
    query = """
        UPDATE officials
        SET name = :name
        WHERE officials.tournament_id = :tournament_id
        AND officials.id = :official_id
        """
    await database.execute(
        query=query,
        values={
            "tournament_id": tournament_id,
            "official_id": official_id,
            "name": official_body.name,
        },
    )


async def sql_delete_official(tournament_id: TournamentId, official_id: OfficialId) -> None:
    query = "DELETE FROM officials WHERE id = :official_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"official_id": official_id, "tournament_id": tournament_id}
    )


async def sql_delete_officials_of_tournament(tournament_id: TournamentId) -> None:
    query = "DELETE FROM officials WHERE tournament_id = :tournament_id"
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})
