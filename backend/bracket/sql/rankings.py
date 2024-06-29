from bracket.database import database
from bracket.models.db.ranking import Ranking, RankingBody, RankingCreateBody
from bracket.utils.id_types import RankingId, TournamentId


async def get_all_rankings_in_tournament(tournament_id: TournamentId) -> list[Ranking]:
    query = """
        SELECT *
        FROM rankings
        WHERE rankings.tournament_id = :tournament_id
        ORDER BY position
        """
    result = await database.fetch_all(query=query, values={"tournament_id": tournament_id})
    return [Ranking.model_validate(dict(x._mapping)) for x in result]


async def sql_update_ranking(
    tournament_id: TournamentId, ranking_id: RankingId, ranking_body: RankingBody
) -> list[Ranking]:
    query = """
        UPDATE rankings
        SET position = :position,
            win_points = :win_points,
            draw_points = :draw_points,
            loss_points = :loss_points
        WHERE rankings.tournament_id = :tournament_id
        AND rankings.id = :ranking_id
        """
    result = await database.fetch_all(
        query=query,
        values={
            "ranking_id": ranking_id,
            "tournament_id": tournament_id,
            "win_points": float(ranking_body.win_points),
            "draw_points": float(ranking_body.draw_points),
            "loss_points": float(ranking_body.loss_points),
            "position": ranking_body.position,
        },
    )
    return [Ranking.model_validate(dict(x._mapping)) for x in result]


async def sql_delete_ranking(tournament_id: TournamentId, ranking_id: RankingId) -> None:
    query = "DELETE FROM rankings WHERE id = :ranking_id AND tournament_id = :tournament_id"
    await database.fetch_one(
        query=query, values={"ranking_id": ranking_id, "tournament_id": tournament_id}
    )


async def sql_create_ranking(
    tournament_id: TournamentId, ranking_body: RankingCreateBody, position: int
) -> None:
    query = """
        INSERT INTO rankings
        (tournament_id, position, win_points, draw_points, loss_points)
        VALUES (:tournament_id, :position, :win_points, :draw_points, :loss_points)
        """

    await database.execute(
        query=query,
        values={
            "tournament_id": tournament_id,
            "win_points": float(ranking_body.win_points),
            "draw_points": float(ranking_body.draw_points),
            "loss_points": float(ranking_body.loss_points),
            "position": position,
        },
    )
