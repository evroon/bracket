from heliclockter import timedelta

from bracket.logic.planning.matches import get_scheduled_matches_per_court
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import sql_reschedule_match
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.types import assert_some


def get_active_and_next_rounds(
    stage_item: StageItemWithRounds,
) -> tuple[RoundWithMatches | None, RoundWithMatches | None]:
    active_round = next((round_ for round_ in stage_item.rounds if round_.is_active), None)

    def is_round_in_future(round_: RoundWithMatches) -> bool:
        return (
            (assert_some(round_.id) > assert_some(active_round.id))
            if active_round is not None
            else True
        )

    rounds_chronologically_sorted = sorted(stage_item.rounds, key=lambda r: assert_some(r.id))
    next_round = next(
        (round_ for round_ in rounds_chronologically_sorted if is_round_in_future(round_)),
        None,
    )
    return active_round, next_round


async def schedule_all_matches_for_swiss_round(
    tournament_id: int, active_round: RoundWithMatches
) -> None:
    courts = await get_all_courts_in_tournament(tournament_id)
    stages = await get_full_tournament_details(tournament_id)
    matches_per_court = get_scheduled_matches_per_court(stages)

    if len(courts) < 1:
        return

    assert len(active_round.matches) <= len(courts)

    for i, match in enumerate(active_round.matches):
        court_id = assert_some(courts[i].id)
        last_match = matches_per_court[court_id][-1]

        await sql_reschedule_match(
            assert_some(match.id),
            court_id,
            assert_some(last_match.match.start_time) + timedelta(minutes=15),
            assert_some(last_match.match.position_in_schedule) + 1,
        )
