from bracket.logic.ranking.elo import (
    determine_team_ranking_for_stage_item,
)
from bracket.logic.ranking.statistics import TeamStatistics
from bracket.models.db.util import StageWithStageItems
from bracket.sql.rankings import get_ranking_for_stage_item
from bracket.utils.id_types import (
    StageItemId,
    StageItemInputId,
    TournamentId,
)
from bracket.utils.types import assert_some

StageItemXTeamRanking = dict[StageItemId, list[tuple[StageItemInputId, TeamStatistics]]]


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
