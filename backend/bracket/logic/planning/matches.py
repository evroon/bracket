from collections import defaultdict
from typing import NamedTuple

from heliclockter import datetime_utc, timedelta

from bracket.models.db.match import (
    MatchRescheduleBody,
    MatchWithDetails,
    MatchWithDetailsDefinitive,
)
from bracket.models.db.tournament import Tournament
from bracket.models.db.tournament_break import TournamentBreak
from bracket.models.db.util import StageWithStageItems
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import (
    sql_reschedule_match_and_determine_duration_and_margin,
)
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournament_breaks import get_all_breaks_in_tournament
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.id_types import CourtId, MatchId, StageItemId, TournamentId
from bracket.utils.types import assert_some


def match_has_two_participants(match: MatchWithDetails | MatchWithDetailsDefinitive) -> bool:
    """
    Check if a match has two actual participants.

    A match is playable if both sides have either:
    - A direct team assignment (stage_item_input with team_id)
    - A winner/loser from a completed match

    Matches where one or both sides are empty (byes) should not be scheduled.
    """
    def side_has_participant(
        stage_item_input: any,
        input_id: int | None,
        winner_from: int | None,
        loser_from: int | None,
    ) -> bool:
        # Has a direct team assignment with an actual team
        if stage_item_input is not None and stage_item_input.team_id is not None:
            return True
        # Has a reference to get winner/loser from another match
        if winner_from is not None or loser_from is not None:
            return True
        # Has an input slot assigned (even if team not yet determined)
        if input_id is not None:
            return True
        return False

    side1_has = side_has_participant(
        match.stage_item_input1,
        match.stage_item_input1_id,
        match.stage_item_input1_winner_from_match_id,
        match.stage_item_input1_loser_from_match_id,
    )
    side2_has = side_has_participant(
        match.stage_item_input2,
        match.stage_item_input2_id,
        match.stage_item_input2_winner_from_match_id,
        match.stage_item_input2_loser_from_match_id,
    )

    return side1_has and side2_has


def adjust_for_breaks(
    start_time: datetime_utc,
    duration_minutes: int,
    breaks: list[TournamentBreak],
) -> datetime_utc:
    """Push start_time past any overlapping break windows."""
    sorted_breaks = sorted(breaks, key=lambda b: b.start_time)
    changed = True
    while changed:
        changed = False
        for brk in sorted_breaks:
            match_end = start_time + timedelta(minutes=duration_minutes)
            if start_time < brk.end_time and match_end > brk.start_time:
                start_time = brk.end_time
                changed = True
                break
    return start_time


async def schedule_all_unscheduled_matches(
    tournament_id: TournamentId, stages: list[StageWithStageItems]
) -> None:
    """
    Schedule all unscheduled matches across all available courts.

    Distributes matches across courts to maximize parallelism:
    - Tracks when each court becomes available
    - Assigns each match to the court that's free soonest
    - Processes rounds in order (earlier rounds before later rounds)
    - Skips matches that don't have two participants (byes)
    - Respects match dependencies: matches wait for prerequisite matches to finish
    """
    tournament = await sql_get_tournament(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)
    breaks = await get_all_breaks_in_tournament(tournament_id)

    if len(stages) < 1 or len(courts) < 1:
        return

    # Track next available time for each court
    court_next_available = {court.id: tournament.start_time for court in courts}
    # Track when each match ends, so dependent matches wait for prerequisites
    match_end_times: dict[MatchId, datetime_utc] = {}
    position_counter = 0

    # Build a mapping of stage_item_id -> list of match IDs for cross-stage dependencies
    stage_item_match_ids: dict[StageItemId, list[MatchId]] = defaultdict(list)
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    stage_item_match_ids[stage_item.id].append(match.id)

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
                        # Only schedule matches that:
                        # 1. Haven't been scheduled yet
                        # 2. Have two actual participants (not byes)
                        if (
                            match.start_time is None
                            and match.position_in_schedule is None
                            and match_has_two_participants(match)
                        ):
                            round_matches.append(match)

            # Schedule each match in this round to the court that's available soonest
            for match in round_matches:
                # Determine earliest start based on prerequisite matches
                earliest_start = tournament.start_time
                for prereq_id in (
                    match.stage_item_input1_winner_from_match_id,
                    match.stage_item_input2_winner_from_match_id,
                    match.stage_item_input1_loser_from_match_id,
                    match.stage_item_input2_loser_from_match_id,
                ):
                    if prereq_id is not None and prereq_id in match_end_times:
                        if match_end_times[prereq_id] > earliest_start:
                            earliest_start = match_end_times[prereq_id]

                # Check cross-stage dependencies: if inputs come from another
                # stage item (via winner_from_stage_item_id), wait for all
                # matches in that source stage item to finish.
                for stage_input in (match.stage_item_input1, match.stage_item_input2):
                    source_id = getattr(stage_input, "winner_from_stage_item_id", None)
                    if source_id is not None:
                        for source_match_id in stage_item_match_ids.get(source_id, []):
                            if source_match_id in match_end_times:
                                if match_end_times[source_match_id] > earliest_start:
                                    earliest_start = match_end_times[source_match_id]

                # Find the court that results in the earliest actual start time
                # (accounting for both court availability, dependency constraints, and breaks)
                match_duration = match.duration_minutes + (match.margin_minutes or 0)
                best_court_id = min(
                    court_next_available,
                    key=lambda c: adjust_for_breaks(
                        max(court_next_available[c], earliest_start),
                        match_duration,
                        breaks,
                    ),
                )
                start_time = adjust_for_breaks(
                    max(court_next_available[best_court_id], earliest_start),
                    match_duration,
                    breaks,
                )

                await sql_reschedule_match_and_determine_duration_and_margin(
                    best_court_id,
                    start_time,
                    position_counter,
                    match,
                    tournament,
                )

                # Update court availability and track this match's end time
                match_duration = match.duration_minutes + (match.margin_minutes or 0)
                end_time = start_time + timedelta(minutes=match_duration)
                court_next_available[best_court_id] = end_time
                match_end_times[match.id] = end_time
                position_counter += 1


class MatchPosition(NamedTuple):
    match: MatchWithDetailsDefinitive | MatchWithDetails
    position: float


async def reorder_matches_for_court(
    tournament: Tournament,
    scheduled_matches: list[MatchPosition],
    court_id: CourtId,
    breaks: list[TournamentBreak] | None = None,
) -> None:
    matches_this_court = sorted(
        (match_pos for match_pos in scheduled_matches if match_pos.match.court_id == court_id),
        key=lambda mp: mp.position,
    )

    last_start_time = tournament.start_time
    for i, match_pos in enumerate(matches_this_court):
        match_duration = match_pos.match.duration_minutes + match_pos.match.margin_minutes
        if breaks:
            last_start_time = adjust_for_breaks(last_start_time, match_duration, breaks)
        await sql_reschedule_match_and_determine_duration_and_margin(
            court_id,
            last_start_time,
            position_in_schedule=i,
            match=match_pos.match,
            tournament=tournament,
        )
        last_start_time = last_start_time + timedelta(
            minutes=match_duration
        )


async def handle_match_reschedule(
    tournament: Tournament, body: MatchRescheduleBody, match_id: MatchId
) -> None:
    if body.old_position == body.new_position and body.old_court_id == body.new_court_id:
        return

    stages = await get_full_tournament_details(tournament.id)
    breaks = await get_all_breaks_in_tournament(tournament.id)
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

    await reorder_matches_for_court(tournament, scheduled_matches, body.new_court_id, breaks)

    if body.new_court_id != body.old_court_id:
        await reorder_matches_for_court(tournament, scheduled_matches, body.old_court_id, breaks)


async def update_start_times_of_matches(tournament_id: TournamentId) -> None:
    stages = await get_full_tournament_details(tournament_id)
    tournament = await sql_get_tournament(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)
    breaks = await get_all_breaks_in_tournament(tournament_id)
    scheduled_matches = get_scheduled_matches(stages)

    for court in courts:
        await reorder_matches_for_court(tournament, scheduled_matches, court.id, breaks)


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
