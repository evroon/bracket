from heliclockter import datetime_utc, timedelta

from bracket.logic.planning.matches import get_scheduled_matches_per_court
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import (
    sql_reschedule_match_and_determine_duration_and_margin,
)
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.id_types import TournamentId
from bracket.utils.types import assert_some


class MatchTimingAdjustmentInfeasible(Exception):
    pass


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
    tournament_id: TournamentId,
    active_round: RoundWithMatches,
    adjust_to_time: datetime_utc | None = None,
) -> None:
    courts = await get_all_courts_in_tournament(tournament_id)
    stages = await get_full_tournament_details(tournament_id)
    tournament = await sql_get_tournament(tournament_id)
    matches_per_court = get_scheduled_matches_per_court(stages)
    rescheduling_operations = []

    if len(courts) < 1:
        return

    assert len(active_round.matches) <= len(courts)

    for i, match in enumerate(active_round.matches):
        court_id = assert_some(courts[i].id)
        last_match = (
            next((m for m in matches_per_court[court_id][::-1] if m.match.id != match.id), None)
            if court_id in matches_per_court
            else None
        )

        if last_match is not None:
            timing_difference_minutes = 0.0
            if adjust_to_time is not None:
                last_match_end = last_match.match.end_time
                timing_difference_minutes = (adjust_to_time - last_match_end).total_seconds() // 60

                if (
                    timing_difference_minutes < 0
                    and -timing_difference_minutes > last_match.match.margin_minutes
                ):
                    raise MatchTimingAdjustmentInfeasible(
                        "A match from the previous round is still happening"
                    )

                if timing_difference_minutes != 0:
                    last_match_adjusted = last_match.match.model_copy(
                        update={
                            "custom_margin_minutes": last_match.match.margin_minutes
                            + timing_difference_minutes
                        }
                    )
                    rescheduling_operations.append(
                        sql_reschedule_match_and_determine_duration_and_margin(
                            assert_some(last_match.match.id),
                            court_id,
                            assert_some(last_match.match.start_time),
                            assert_some(last_match.match.position_in_schedule),
                            last_match_adjusted,
                            tournament,
                        )
                    )

            start_time = assert_some(last_match.match.start_time) + timedelta(
                minutes=match.duration_minutes
                + last_match.match.margin_minutes
                + timing_difference_minutes
            )
            pos_in_schedule = assert_some(last_match.match.position_in_schedule) + 1
        else:
            start_time = tournament.start_time
            pos_in_schedule = 1

        rescheduling_operations.append(
            sql_reschedule_match_and_determine_duration_and_margin(
                assert_some(match.id), court_id, start_time, pos_in_schedule, match, tournament
            )
        )

    # TODO: if safe: await asyncio.gather(*rescheduling_operations)
    for op in rescheduling_operations:
        await op
