from bracket.database import database
from bracket.models.db.round import RoundInsertable
from bracket.models.db.util import RoundWithMatches
from bracket.sql.stage_items import get_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import RoundId, StageItemId, TournamentId


async def sql_create_round(round_: RoundInsertable) -> RoundId:
    query = """
        INSERT INTO rounds (created, is_draft, name, stage_item_id)
        VALUES (NOW(), :is_draft, :name, :stage_item_id)
        RETURNING id
        """
    result: RoundId = await database.fetch_val(
        query=query,
        values={
            "name": round_.name,
            "is_draft": round_.is_draft,
            "stage_item_id": round_.stage_item_id,
        },
    )
    return result


async def get_rounds_for_stage_item(
    tournament_id: TournamentId, stage_item_id: StageItemId
) -> list[RoundWithMatches]:
    stage_item = await get_stage_item(tournament_id, stage_item_id)
    return stage_item.rounds


async def get_round_by_id(tournament_id: TournamentId, round_id: RoundId) -> RoundWithMatches:
    stages = await get_full_tournament_details(
        tournament_id, no_draft_rounds=False, round_id=round_id
    )

    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                if round_ is not None:
                    return round_

    raise ValueError(f"Could not find round with id {round_id} for tournament {tournament_id}")


async def get_next_round_name(tournament_id: TournamentId, stage_item_id: StageItemId) -> str:
    query = """
        SELECT count(*) FROM rounds
        JOIN stage_items on stage_items.id = rounds.stage_item_id
        JOIN stages on stage_items.stage_id = stages.id
        WHERE stages.tournament_id = :tournament_id
        AND rounds.stage_item_id = :stage_item_id
    """
    round_count = int(
        await database.fetch_val(
            query=query, values={"tournament_id": tournament_id, "stage_item_id": stage_item_id}
        )
    )
    return f"Round {round_count + 1:02d}"


async def sql_delete_rounds_for_stage_item_id(stage_item_id: StageItemId) -> None:
    query = """
        DELETE FROM rounds
        WHERE rounds.stage_item_id = :stage_item_id
        """
    await database.execute(query=query, values={"stage_item_id": stage_item_id})


async def sql_delete_round(round_id: RoundId) -> None:
    query = """
        DELETE FROM rounds
        WHERE rounds.id = :round_id
    """
    await database.execute(query=query, values={"round_id": round_id})


async def set_round_active_or_draft(
    round_id: RoundId, tournament_id: TournamentId, *, is_draft: bool
) -> None:
    query = """
        UPDATE rounds
        SET
            is_draft =
                CASE WHEN rounds.id=:round_id THEN :is_draft
                     ELSE is_draft AND NOT :is_draft
                END
        WHERE rounds.id IN (
            SELECT rounds.id
            FROM rounds
            JOIN stage_items ON rounds.stage_item_id = stage_items.id
            JOIN stages s on s.id = stage_items.stage_id
            WHERE s.tournament_id = :tournament_id
        )
    """
    await database.execute(
        query=query,
        values={
            "tournament_id": tournament_id,
            "round_id": round_id,
            "is_draft": is_draft,
        },
    )
