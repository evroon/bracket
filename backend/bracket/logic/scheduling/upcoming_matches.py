from fastapi import HTTPException

from bracket.logic.scheduling.ladder_players_iter import get_possible_upcoming_matches_for_players
from bracket.models.db.match import MatchFilter, SuggestedMatch, SuggestedVirtualMatch
from bracket.models.db.round import Round
from bracket.models.db.stage_item import StageType
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.types import assert_some


async def get_upcoming_matches_for_swiss_round(
    match_filter: MatchFilter, round_: Round, tournament_id: int
) -> list[SuggestedMatch | SuggestedVirtualMatch]:
    [stage] = await get_full_tournament_details(tournament_id, stage_item_id=round_.stage_item_id)
    assert len(stage.stage_items) == 1
    [stage_item] = stage.stage_items

    if stage_item.type is not StageType.SWISS:
        raise HTTPException(400, 'There is no draft round, so no matches can be scheduled.')

    upcoming_matches = await get_possible_upcoming_matches_for_players(
        tournament_id, match_filter, assert_some(stage_item.id), assert_some(round_.id)
    )

    return upcoming_matches
