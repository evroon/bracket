from fastapi import HTTPException

from bracket.logic.scheduling.ladder_teams import get_possible_upcoming_matches_for_swiss
from bracket.models.db.match import MatchFilter, SuggestedMatch
from bracket.models.db.round import Round
from bracket.models.db.stage_item import StageType
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.sql.rounds import get_rounds_for_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.id_types import StageItemId, TournamentId


async def get_draft_round_in_stage_item(
    tournament_id: TournamentId,
    stage_item_id: StageItemId,
) -> tuple[RoundWithMatches, StageItemWithRounds]:
    [stage] = await get_full_tournament_details(tournament_id, stage_item_ids={stage_item_id})
    draft_round, stage_item = next(
        (
            (round_, stage_item)
            for stage_item in stage.stage_items
            for round_ in stage_item.rounds
            if round_.is_draft
        ),
        (None, None),
    )
    if draft_round is None or stage_item is None:
        raise HTTPException(400, "There is no draft round, so no matches can be scheduled.")
    return draft_round, stage_item


async def get_upcoming_matches_for_swiss_round(
    match_filter: MatchFilter,
    stage_item: StageItemWithRounds,
    round_: Round,
    tournament_id: TournamentId,
) -> list[SuggestedMatch]:
    if stage_item.type is not StageType.SWISS:
        raise HTTPException(400, "Expected stage item to be of type SWISS.")

    if not round_.is_draft:
        raise HTTPException(400, "There is no draft round, so no matches can be scheduled.")

    rounds = await get_rounds_for_stage_item(tournament_id, stage_item.id)
    return get_possible_upcoming_matches_for_swiss(match_filter, rounds, stage_item.inputs)
