from typing import Literal, cast

from bracket.database import database
from bracket.models.db.stage import Stage
from bracket.models.db.util import StageWithStageItems
from bracket.utils.id_types import RoundId, StageId, StageItemId, TournamentId
from bracket.utils.types import dict_without_none


async def get_full_tournament_details(
    tournament_id: TournamentId,
    round_id: RoundId | None = None,
    stage_id: StageId | None = None,
    stage_item_ids: set[StageItemId] | None = None,
    *,
    no_draft_rounds: bool = False,
) -> list[StageWithStageItems]:
    draft_filter = "AND rounds.is_draft IS FALSE" if no_draft_rounds else ""
    round_filter = "AND rounds.id = :round_id" if round_id is not None else ""
    stage_filter = "AND stages.id = :stage_id" if stage_id is not None else ""
    stage_item_filter = (
        "AND stage_items.id = any(:stage_item_ids)" if stage_item_ids is not None else ""
    )
    stage_item_filter_join = (
        "LEFT JOIN stage_items on stages.id = stage_items.stage_id"
        if stage_item_ids is not None
        else ""
    )

    query = f"""
        WITH teams_with_players AS (
            SELECT DISTINCT ON (teams.id)
                teams.*,
                to_json(array_remove(array_agg(p), NULL)) as players
            FROM teams
            LEFT JOIN players_x_teams pt on pt.team_id = teams.id
            LEFT JOIN players p on pt.player_id = p.id
            WHERE teams.tournament_id = :tournament_id
            GROUP BY teams.id
        ), matches_with_teams AS (
            SELECT DISTINCT ON (matches.id)
                matches.*,
                to_json(t1) as team1,
                to_json(t2) as team2,
                to_json(c) as court
            FROM matches
            LEFT JOIN teams_with_players t1 on t1.id = matches.team1_id
            LEFT JOIN teams_with_players t2 on t2.id = matches.team2_id
            LEFT JOIN rounds r on matches.round_id = r.id
            LEFT JOIN stage_items si on r.stage_item_id = si.id
            LEFT JOIN stages s2 on s2.id = si.stage_id
            LEFT JOIN courts c on matches.court_id = c.id
            WHERE s2.tournament_id = :tournament_id
        ), rounds_with_matches AS (
            SELECT DISTINCT ON (rounds.id)
                rounds.*,
                to_json(array_agg(m.*)) AS matches
            FROM rounds
            LEFT JOIN matches_with_teams m on m.round_id = rounds.id
            LEFT JOIN stage_items si on rounds.stage_item_id = si.id
            LEFT JOIN stages s2 on s2.id = si.stage_id
            WHERE s2.tournament_id = :tournament_id
            {draft_filter}
            {round_filter}
            GROUP BY rounds.id
        ), stage_items_with_rounds AS (
            SELECT DISTINCT ON (stage_items.id)
                stage_items.*,
                to_json(array_agg(r.*)) AS rounds
            FROM stage_items
            JOIN stages st on stage_items.stage_id = st.id
            LEFT JOIN rounds_with_matches r on r.stage_item_id = stage_items.id
            WHERE st.tournament_id = :tournament_id
            {stage_item_filter}
            GROUP BY stage_items.id
        ), stage_items_with_inputs AS (
            SELECT DISTINCT ON (stage_items.id)
                stage_items.id,
                to_json(array_agg(sii)) AS inputs
            FROM stage_items
            LEFT JOIN stage_item_inputs sii ON stage_items.id = sii.stage_item_id
            WHERE sii.tournament_id = :tournament_id
            {stage_item_filter}
            GROUP BY stage_items.id
            ORDER BY stage_items.id
        ), stage_items_with_rounds_and_inputs AS (
            SELECT stage_items.*, stage_items_with_inputs.inputs, stage_items_with_rounds.rounds
            FROM stage_items
            JOIN stage_items_with_rounds ON stage_items_with_rounds.id = stage_items.id
            LEFT JOIN stage_items_with_inputs ON stage_items_with_inputs.id = stage_items.id
            ORDER BY stage_items.name
        )
        SELECT stages.*, to_json(array_agg(r.*)) AS stage_items
        FROM stages
        LEFT JOIN stage_items_with_rounds_and_inputs r on stages.id = r.stage_id
        {stage_item_filter_join}
        WHERE stages.tournament_id = :tournament_id
        {stage_filter}
        {stage_item_filter}
        GROUP BY stages.id
        ORDER BY stages.id
    """
    values = dict_without_none(
        {
            "tournament_id": tournament_id,
            "round_id": round_id,
            "stage_id": stage_id,
            "stage_item_ids": stage_item_ids,
        }
    )
    result = await database.fetch_all(query=query, values=values)
    return [StageWithStageItems.model_validate(dict(x._mapping)) for x in result]


async def sql_delete_stage(tournament_id: TournamentId, stage_id: StageId) -> None:
    async with database.transaction():
        query = """
            DELETE FROM stage_items
            WHERE stage_items.stage_id = :stage_id
            """
        await database.execute(query=query, values={"stage_id": stage_id})

        query = """
            DELETE FROM stages
            WHERE stages.id = :stage_id
            AND stages.tournament_id = :tournament_id
            """
        await database.execute(
            query=query, values={"stage_id": stage_id, "tournament_id": tournament_id}
        )


async def sql_create_stage(tournament_id: TournamentId) -> Stage:
    query = """
        INSERT INTO stages (created, is_active, name, tournament_id)
        VALUES (NOW(), false, :name, :tournament_id)
        RETURNING *
        """
    result = await database.fetch_one(
        query=query,
        values={"tournament_id": tournament_id, "name": "Stage"},
    )

    if result is None:
        raise ValueError("Could not create stage")

    return Stage.model_validate(dict(result._mapping))


async def get_next_stage_in_tournament(
    tournament_id: TournamentId, direction: Literal["next", "previous"]
) -> StageId | None:
    select_query = """
        SELECT id
        FROM stages
        WHERE
            CASE WHEN :direction='next'
            THEN (
                id > COALESCE(
                    (
                        SELECT id FROM stages AS t
                        WHERE is_active IS TRUE
                        AND stages.tournament_id = :tournament_id
                        ORDER BY id ASC
                        LIMIT 1
                    ),
                    -1
                )
            )
            ELSE (
                id < COALESCE(
                    (
                        SELECT id FROM stages AS t
                        WHERE is_active IS TRUE
                        AND stages.tournament_id = :tournament_id
                        ORDER BY id DESC
                        LIMIT 1
                    ),
                    10000000000
                )
            )
            END
        AND stages.tournament_id = :tournament_id
        AND is_active IS FALSE
    """
    return cast(
        StageId | None,
        await database.execute(
            query=select_query,
            values={"tournament_id": tournament_id, "direction": direction},
        ),
    )


async def sql_activate_next_stage(
    new_active_stage_id: StageId, tournament_id: TournamentId
) -> None:
    update_query = """
        UPDATE stages
        SET is_active = (stages.id = :new_active_stage_id)
        WHERE stages.tournament_id = :tournament_id

    """
    await database.execute(
        query=update_query,
        values={"tournament_id": tournament_id, "new_active_stage_id": new_active_stage_id},
    )
