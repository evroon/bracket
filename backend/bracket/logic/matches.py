from typing import NamedTuple

from heliclockter import datetime_utc, timedelta

from bracket.models.db.match import (
    Match,
    MatchCreateBody,
    MatchRescheduleBody,
    MatchWithDetails,
    MatchWithDetailsDefinitive,
)
from bracket.sql.courts import get_all_courts_in_tournament, get_all_free_courts_in_round
from bracket.sql.matches import sql_create_match, sql_reschedule_match
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.types import assert_some


async def create_match_and_assign_free_court(
    tournament_id: int,
    match_body: MatchCreateBody,
) -> Match:
    tournament = await sql_get_tournament(tournament_id)
    next_free_court_id = None

    if tournament.auto_assign_courts and match_body.court_id is None:
        free_courts = await get_all_free_courts_in_round(tournament_id, match_body.round_id)
        if len(free_courts) > 0:
            next_free_court_id = free_courts[0].id

    match_body = match_body.copy(update={'court_id': next_free_court_id})
    return await sql_create_match(match_body)


async def schedule_all_matches(tournament_id: int) -> None:
    stages = await get_full_tournament_details(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)

    matches = [
        match
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
    ]
    match_count_per_court: dict[int, int] = {assert_some(court.id): 0 for court in courts}
    matches_per_court: dict[int, list[Match]] = {assert_some(court.id): [] for court in courts}
    now = datetime_utc.now()

    for match in matches:
        court_id = sorted(match_count_per_court.items(), key=lambda x: x[1])[0][0]

        try:
            position_in_schedule = len(matches_per_court[court_id])
            last_match = matches_per_court[court_id][-1]
            start_time = assert_some(last_match.start_time) + timedelta(minutes=15)
        except IndexError:
            start_time = now
            position_in_schedule = 0

        await sql_reschedule_match(
            assert_some(match.id), court_id, start_time, position_in_schedule
        )

        matches_per_court[court_id].append(
            match.copy(
                update={'start_time': start_time, 'position_in_schedule': position_in_schedule}
            )
        )
        match_count_per_court[court_id] += 1


class MatchPosition(NamedTuple):
    match: MatchWithDetailsDefinitive | MatchWithDetails
    position: float


async def reorder_matches_for_court(
    scheduled_matches: list[MatchPosition],
    body: MatchRescheduleBody,
    court_id: int,
) -> None:
    assert body.new_position is not None and body.old_position is not None
    matches_this_court = sorted(
        (match_pos for match_pos in scheduled_matches if match_pos.match.court_id == court_id),
        key=lambda mp: mp.position,
    )

    if body.new_court_id == body.old_court_id:
        matches_this_court[body.new_position], matches_this_court[body.old_position] = (
            matches_this_court[body.old_position],
            matches_this_court[body.new_position],
        )

    for i, match_pos in enumerate(matches_this_court):
        await sql_reschedule_match(
            assert_some(match_pos.match.id),
            court_id,
            assert_some(match_pos.match.start_time),
            i,
        )


async def handle_match_reschedule(tournament_id: int, body: MatchRescheduleBody) -> None:
    if body.old_position == body.new_position and body.old_court_id == body.new_court_id:
        return

    stages = await get_full_tournament_details(tournament_id)
    scheduled_matches = [
        MatchPosition(match=match, position=float(assert_some(match.position_in_schedule)))
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
        if match.start_time is not None
    ]

    if body.new_court_id == body.old_court_id:
        await reorder_matches_for_court(scheduled_matches, body, body.new_court_id)
    else:
        scheduled_matches_adjusted = []
        for match_pos in scheduled_matches:
            # For match in prev position: Set new position
            if (
                match_pos.position == body.old_position
                and match_pos.match.court_id == body.old_court_id
            ):
                # match_pos.match.court_id = body.new_court_id
                scheduled_matches_adjusted.append(
                    MatchPosition(
                        match=match_pos.match.copy(update={'court_id': body.new_court_id}),
                        position=body.new_position - 0.9,
                    )
                )
            else:
                scheduled_matches_adjusted.append(match_pos)

        await reorder_matches_for_court(scheduled_matches_adjusted, body, body.new_court_id)
        await reorder_matches_for_court(scheduled_matches_adjusted, body, body.old_court_id)
