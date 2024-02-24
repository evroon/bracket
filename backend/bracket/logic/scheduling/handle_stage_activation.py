from bracket.logic.ranking.elo import (
    determine_team_ranking_for_stage_item,
)
from bracket.models.db.match import MatchWithDetails
from bracket.sql.matches import sql_get_match, sql_update_team_ids_for_match
from bracket.sql.stage_items import get_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import MatchId, StageId, StageItemId, TeamId, TournamentId
from bracket.utils.types import assert_some


async def determine_team_id(
    tournament_id: TournamentId,
    winner_from_stage_item_id: StageItemId | None,
    winner_position: int | None,
    winner_from_match_id: MatchId | None,
) -> TeamId | None:
    if winner_from_stage_item_id is not None and winner_position is not None:
        stage_item = await get_stage_item(tournament_id, winner_from_stage_item_id)
        assert stage_item is not None

        team_ranking = determine_team_ranking_for_stage_item(stage_item)
        if len(team_ranking) >= winner_position:
            return team_ranking[winner_position - 1][0]

        return None

    if winner_from_match_id is not None:
        match = await sql_get_match(winner_from_match_id)
        winner_index = match.get_winner_index()
        if winner_index is not None:
            team_id = match.team1_id if match.get_winner_index() == 1 else match.team2_id
            assert team_id is not None
            return team_id

        return None

    raise ValueError("Unexpected match type")


async def set_team_ids_for_match(tournament_id: TournamentId, match: MatchWithDetails) -> None:
    team1_id = await determine_team_id(
        tournament_id,
        match.team1_winner_from_stage_item_id,
        match.team1_winner_position,
        match.team1_winner_from_match_id,
    )
    team2_id = await determine_team_id(
        tournament_id,
        match.team2_winner_from_stage_item_id,
        match.team2_winner_position,
        match.team2_winner_from_match_id,
    )

    await sql_update_team_ids_for_match(assert_some(match.id), team1_id, team2_id)


async def update_matches_in_activated_stage(tournament_id: TournamentId, stage_id: StageId) -> None:
    [stage] = await get_full_tournament_details(tournament_id, stage_id=stage_id)

    for stage_item in stage.stage_items:
        for round_ in stage_item.rounds:
            for match in round_.matches:
                if isinstance(match, MatchWithDetails):
                    await set_team_ids_for_match(tournament_id, match)
