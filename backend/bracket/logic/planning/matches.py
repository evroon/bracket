from collections import defaultdict
from typing import NamedTuple

from heliclockter import timedelta

from bracket.models.db.match import (
    MatchRescheduleBody,
    MatchWithDetails,
    MatchWithDetailsDefinitive,
)
from bracket.models.db.tournament import Tournament
from bracket.models.db.util import StageWithStageItems
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import (
    sql_reschedule_match_and_determine_duration_and_margin,
)
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.id_types import CourtId, MatchId, TournamentId
from bracket.utils.types import assert_some


async def schedule_all_unscheduled_matches(
    tournament_id: TournamentId, stages: list[StageWithStageItems]
) -> None:
    """
    Schedule all unscheduled matches across all available courts.

    Distributes matches across courts to maximize parallelism:
    - Tracks when each court becomes available
    - Assigns each match to the court that's free soonest
    - Processes rounds in order (earlier rounds before later rounds)
    """
    tournament = await sql_get_tournament(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)

    if len(stages) < 1 or len(courts) < 1:
        return

    # Track next available time for each court
    court_next_available = {court.id: tournament.start_time for court in courts}
    position_counter = 0

    # Collect all matches grouped by round, maintaining round order
    # Process rounds in sequence (all round 1 matches before round 2, etc.)
    for stage in stages:
        stage_items = sorted(stage.stage_items, key=lambda x: x.name)

        # Get max number of rounds across all stage items in this stage
        max_rounds = max(
            (len(stage_item.rounds) for stage_item in stage_items),
            default=0,
        )

        # Process round by round across all stage items
        for round_idx in range(max_rounds):
            round_matches = []

            # Collect all matches from this round index across all stage items
            for stage_item in stage_items:
                sorted_rounds = sorted(stage_item.rounds, key=lambda r: r.id)
                if round_idx < len(sorted_rounds):
                    round_ = sorted_rounds[round_idx]
                    for match in round_.matches:
                        if match.start_time is None and match.position_in_schedule is None:
                            round_matches.append(match)

            # Schedule each match in this round to the court that's available soonest
            for match in round_matches:
                # Find the court with the earliest available time
                best_court_id = min(court_next_available, key=lambda c: court_next_available[c])
                start_time = court_next_available[best_court_id]

                await sql_reschedule_match_and_determine_duration_and_margin(
                    best_court_id,
                    start_time,
                    position_counter,
                    match,
                    tournament,
                )

                # Update court availability
                match_duration = match.duration_minutes + (match.margin_minutes or 0)
                court_next_available[best_court_id] = start_time + timedelta(
                    minutes=match_duration
                )
                position_counter += 1

    await update_start_times_of_matches(tournament_id)


class MatchPosition(NamedTuple):
    match: MatchWithDetailsDefinitive | MatchWithDetails
    position: float


async def reorder_matches_for_court(
    tournament: Tournament,
    scheduled_matches: list[MatchPosition],
    court_id: CourtId,
) -> None:
    matches_this_court = sorted(
        (match_pos for match_pos in scheduled_matches if match_pos.match.court_id == court_id),
        key=lambda mp: mp.position,
    )

    last_start_time = tournament.start_time
    for i, match_pos in enumerate(matches_this_court):
        await sql_reschedule_match_and_determine_duration_and_margin(
            court_id,
            last_start_time,
            position_in_schedule=i,
            match=match_pos.match,
            tournament=tournament,
        )
        last_start_time = last_start_time + timedelta(
            minutes=match_pos.match.duration_minutes + match_pos.match.margin_minutes
        )


async def handle_match_reschedule(
    tournament: Tournament, body: MatchRescheduleBody, match_id: MatchId
) -> None:
    if body.old_position == body.new_position and body.old_court_id == body.new_court_id:
        return

    stages = await get_full_tournament_details(tournament.id)
    scheduled_matches_old = get_scheduled_matches(stages)

    # For match in prev position: set new position
    scheduled_matches = []
    for match_pos in scheduled_matches_old:
        if match_pos.match.id == match_id:
            if (
                match_pos.position != body.old_position
                or match_pos.match.court_id != body.old_court_id
            ):
                raise ValueError("match_id doesn't match court id or position in schedule")

            offset = (
                -0.5
                if body.new_position < body.old_position or body.new_court_id != body.old_court_id
                else +0.5
            )
            scheduled_matches.append(
                MatchPosition(
                    match=match_pos.match.model_copy(update={"court_id": body.new_court_id}),
                    position=body.new_position + offset,
                )
            )
        else:
            scheduled_matches.append(match_pos)

    await reorder_matches_for_court(tournament, scheduled_matches, body.new_court_id)

    if body.new_court_id != body.old_court_id:
        await reorder_matches_for_court(tournament, scheduled_matches, body.old_court_id)


async def update_start_times_of_matches(tournament_id: TournamentId) -> None:
    stages = await get_full_tournament_details(tournament_id)
    tournament = await sql_get_tournament(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)
    scheduled_matches = get_scheduled_matches(stages)

    for court in courts:
        await reorder_matches_for_court(tournament, scheduled_matches, court.id)


def get_scheduled_matches(stages: list[StageWithStageItems]) -> list[MatchPosition]:
    return [
        MatchPosition(match=match, position=float(assert_some(match.position_in_schedule)))
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
        if match.start_time is not None
    ]


def get_scheduled_matches_per_court(
    stages: list[StageWithStageItems],
) -> dict[int, list[MatchPosition]]:
    scheduled_matches = get_scheduled_matches(stages)
    matches_per_court = defaultdict(list)

    for match_pos in scheduled_matches:
        if match_pos.match.court_id is not None:
            matches_per_court[match_pos.match.court_id].append(match_pos)

    return {
        court_id: sorted(matches, key=lambda mp: assert_some(mp.match.start_time))
        for court_id, matches in matches_per_court.items()
    }
