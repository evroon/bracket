from bracket.database import database
from bracket.models.db.tournament_break import TournamentBreak, TournamentBreakBody
from bracket.utils.id_types import BreakId, TournamentId


async def get_all_breaks_in_tournament(tournament_id: TournamentId) -> list[TournamentBreak]:
    query = """
        SELECT *
        FROM tournament_breaks
        WHERE tournament_breaks.tournament_id = :tournament_id
        ORDER BY start_time
        """
    result = await database.fetch_all(query=query, values={"tournament_id": tournament_id})
    return [TournamentBreak.model_validate(dict(x._mapping)) for x in result]


async def update_break(
    tournament_id: TournamentId, break_id: BreakId, break_body: TournamentBreakBody
) -> list[TournamentBreak]:
    query = """
        UPDATE tournament_breaks
        SET title = :title, start_time = :start_time, end_time = :end_time
        WHERE tournament_breaks.tournament_id = :tournament_id
        AND tournament_breaks.id = :break_id
        """
    result = await database.fetch_all(
        query=query,
        values={
            "tournament_id": tournament_id,
            "break_id": break_id,
            "title": break_body.title,
            "start_time": break_body.start_time,
            "end_time": break_body.end_time,
        },
    )
    return [TournamentBreak.model_validate(dict(x._mapping)) for x in result]


async def sql_delete_break(tournament_id: TournamentId, break_id: BreakId) -> None:
    query = "DELETE FROM tournament_breaks WHERE id = :break_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"break_id": break_id, "tournament_id": tournament_id}
    )


async def sql_delete_breaks_of_tournament(tournament_id: TournamentId) -> None:
    query = "DELETE FROM tournament_breaks WHERE tournament_id = :tournament_id"
    await database.fetch_one(query=query, values={"tournament_id": tournament_id})
