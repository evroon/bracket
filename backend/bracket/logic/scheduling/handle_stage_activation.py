from bracket.logic.ranking.elo import (
    determine_team_ranking_for_stage_item,
)
from bracket.logic.ranking.statistics import TeamStatistics
from bracket.models.db.match import MatchWithDetails
from bracket.models.db.util import StageWithStageItems
from bracket.sql.matches import sql_get_match, sql_update_team_ids_for_match
from bracket.sql.rankings import get_ranking_for_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import MatchId, StageId, StageItemId, TeamId, TournamentId
from bracket.utils.types import assert_some

StageItemXTeamRanking = dict[StageItemId, list[tuple[TeamId, TeamStatistics]]]


async def determine_team_id(
    winner_from_stage_item_id: StageItemId | None,
    winner_position: int | None,
    winner_from_match_id: MatchId | None,
    stage_item_x_team_rankings: StageItemXTeamRanking,
) -> TeamId | None:
    """
    Determine the team ID for a match that didn't have a team assigned yet.

    Either return:
    - A team that was chosen from a previous stage item ranking, or
    - A team that was chosen from a previous match
    """

    if winner_from_stage_item_id is not None and winner_position is not None:
        team_ranking = stage_item_x_team_rankings[winner_from_stage_item_id]
        if len(team_ranking) >= winner_position:
            return team_ranking[winner_position - 1][0]

        return None

    if winner_from_match_id is not None:
        match = await sql_get_match(winner_from_match_id)
        winner_index = match.get_winner_index()

        if winner_index is not None:
            return match.team1_id if winner_index == 1 else match.team2_id

        return None

    raise ValueError("Unexpected match type")


async def set_team_ids_for_match(
    match: MatchWithDetails, stage_item_x_team_rankings: StageItemXTeamRanking
) -> None:
    team1_id = await determine_team_id(
        match.team1_winner_from_stage_item_id,
        match.team1_winner_position,
        match.team1_winner_from_match_id,
        stage_item_x_team_rankings,
    )
    team2_id = await determine_team_id(
        match.team2_winner_from_stage_item_id,
        match.team2_winner_position,
        match.team2_winner_from_match_id,
        stage_item_x_team_rankings,
    )

    await sql_update_team_ids_for_match(match.id, team1_id, team2_id)


async def get_team_rankings_lookup_for_stage(
    tournament_id: TournamentId, stage: StageWithStageItems
) -> StageItemXTeamRanking:
    stage_items = {stage_item.id: stage_item for stage_item in stage.stage_items}
    return {
        stage_item_id: determine_team_ranking_for_stage_item(
            stage_item,
            assert_some(await get_ranking_for_stage_item(tournament_id, stage_item.id)),
        )
        for stage_item_id, stage_item in stage_items.items()
    }


async def get_team_rankings_lookup(tournament_id: TournamentId) -> StageItemXTeamRanking:
    return {
        stage_item_id: team_ranking
        for stage in await get_full_tournament_details(tournament_id)
        for stage_item_id, team_ranking in (
            await get_team_rankings_lookup_for_stage(tournament_id, stage)
        ).items()
    }


async def update_matches_in_activated_stage(tournament_id: TournamentId, stage_id: StageId) -> None:
    [stage] = await get_full_tournament_details(tournament_id, stage_id=stage_id)
    stage_item_x_team_rankings = await get_team_rankings_lookup(tournament_id)

    for stage_item in stage.stage_items:
        for round_ in stage_item.rounds:
            for match in round_.matches:
                if isinstance(match, MatchWithDetails):
                    await set_team_ids_for_match(match, stage_item_x_team_rankings)
