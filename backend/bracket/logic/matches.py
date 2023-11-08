import random
from collections import defaultdict
from typing import NamedTuple

from heliclockter import timedelta

from bracket.models.db.match import (
    Match,
    MatchCreateBody,
    MatchRescheduleBody,
    MatchWithDetails,
    MatchWithDetailsDefinitive,
)
from bracket.models.db.stage_item_inputs import StageItemInputGeneric
from bracket.models.db.tournament import Tournament
from bracket.sql.courts import get_all_courts_in_tournament
from bracket.sql.matches import sql_create_match, sql_reschedule_match
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.tournaments import sql_get_tournament
from bracket.utils.types import assert_some


async def create_match_and_assign_free_court(
    tournament_id: int,
    match_body: MatchCreateBody,
) -> Match:
    return await sql_create_match(match_body)


async def schedule_all_unscheduled_matches(tournament_id: int) -> None:
    tournament = await sql_get_tournament(tournament_id)
    stages = await get_full_tournament_details(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)

    if len(stages) < 0 or len(courts) < 0:
        return

    stage = stages[0]
    stage_items = sorted(stage.stage_items, key=lambda x: x.name)
    for i, stage_item in enumerate(stage_items):
        court = courts[min(i, len(courts) - 1)]
        start_time = tournament.start_time
        position_in_schedule = 0
        for round_ in stage_item.rounds:
            for match in round_.matches:
                start_time += timedelta(minutes=15)
                position_in_schedule += 1

                if match.start_time is None and match.position_in_schedule is None:
                    await sql_reschedule_match(
                        assert_some(match.id), court.id, start_time, position_in_schedule
                    )

    for stage in stages[1:]:
        start_time = tournament.start_time
        position_in_schedule = 0
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    start_time += timedelta(minutes=15)
                    position_in_schedule += 1

                    if match.start_time is None and match.position_in_schedule is None:
                        await sql_reschedule_match(
                            assert_some(match.id), courts[-1].id, start_time, position_in_schedule
                        )


def has_conflict(
    match: MatchWithDetailsDefinitive | MatchWithDetails,
    team_defs: set[int | None],
    matches_per_team: dict[int | None, list[Match]],
) -> bool:
    for team in team_defs:
        for existing_match in matches_per_team[team]:
            if existing_match.start_time == match.start_time:
                return True

    return False


async def todo_schedule_all_matches(tournament_id: int) -> None:
    tournament = await sql_get_tournament(tournament_id)
    stages = await get_full_tournament_details(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)

    match_count_per_court: dict[int, int] = {assert_some(court.id): 0 for court in courts}
    matches_per_court: dict[int, list[Match]] = {assert_some(court.id): [] for court in courts}
    matches_per_team: dict[int | None, list[Match]] = defaultdict(list)

    matches_to_schedule = [
        match.copy(update={'court_id': None, 'position_in_schedule': None})
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
    ]
    await iterative_scheduling(
        match_count_per_court,
        matches_per_court,
        matches_per_team,
        matches_to_schedule,
        tournament,
    )


async def iterative_scheduling(
    match_count_per_court: dict[int, int],
    matches_per_court: dict[int, list[Match]],
    matches_per_team: dict[int | None, list[Match]],
    matches_to_schedule: list[MatchWithDetailsDefinitive | MatchWithDetails],
    tournament: Tournament,
) -> None:
    attempts_since_last_write = 0

    while len(matches_to_schedule) > 0:
        attempts_since_last_write += 1
        match = matches_to_schedule[0]

        StageItemInputGeneric(
            team_id=match.team1_id,
            winner_from_stage_item_id=match.team1_winner_from_stage_item_id,
            winner_position=match.team1_winner_position,
            winner_from_match_id=match.team1_winner_from_match_id,
        )
        StageItemInputGeneric(
            team_id=match.team2_id,
            winner_from_stage_item_id=match.team2_winner_from_stage_item_id,
            winner_position=match.team2_winner_position,
            winner_from_match_id=match.team2_winner_from_match_id,
        )
        team_defs = {match.team1_id, match.team2_id}

        court_id = sorted(match_count_per_court.items(), key=lambda x: x[1])[0][0]

        try:
            position_in_schedule = len(matches_per_court[court_id])
            last_match = matches_per_court[court_id][-1]
            start_time = assert_some(last_match.start_time) + timedelta(minutes=15)
        except IndexError:
            start_time = tournament.start_time
            position_in_schedule = 0

        updated_match = match.copy(
            update={
                'start_time': start_time,
                'position_in_schedule': position_in_schedule,
                'court_id': court_id,
            }
        )

        match_has_conflict = has_conflict(updated_match, team_defs, matches_per_team)
        if match_has_conflict and attempts_since_last_write < 100:
            continue

        match_count_per_court[court_id] += 1
        matches_per_court[court_id].append(updated_match)
        matches_per_team[match.team1_id].append(updated_match)
        matches_per_team[match.team2_id].append(updated_match)
        matches_to_schedule.remove(match)
        attempts_since_last_write = 0
        random.shuffle(matches_to_schedule)

        await sql_reschedule_match(
            assert_some(match.id), court_id, start_time, position_in_schedule
        )


class MatchPosition(NamedTuple):
    match: MatchWithDetailsDefinitive | MatchWithDetails
    position: float


async def reorder_matches_for_court(
    tournament: Tournament,
    scheduled_matches: list[MatchPosition],
    court_id: int,
) -> None:
    matches_this_court = sorted(
        (match_pos for match_pos in scheduled_matches if match_pos.match.court_id == court_id),
        key=lambda mp: mp.position,
    )

    last_start_time = tournament.start_time
    for i, match_pos in enumerate(matches_this_court):
        await sql_reschedule_match(
            assert_some(match_pos.match.id),
            court_id,
            last_start_time,
            i,
        )
        last_start_time = last_start_time + timedelta(minutes=15)


async def handle_match_reschedule(tournament_id: int, body: MatchRescheduleBody) -> None:
    if body.old_position == body.new_position and body.old_court_id == body.new_court_id:
        return

    stages = await get_full_tournament_details(tournament_id)
    tournament = await sql_get_tournament(tournament_id)
    scheduled_matches_old = [
        MatchPosition(match=match, position=float(assert_some(match.position_in_schedule)))
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
        if match.start_time is not None
    ]

    # For match in prev position: set new position
    scheduled_matches = []
    for match_pos in scheduled_matches_old:
        if (
            match_pos.position == body.old_position
            and match_pos.match.court_id == body.old_court_id
        ):
            offset = (
                -0.5
                if body.new_position < body.old_position or body.new_court_id != body.old_court_id
                else +0.5
            )
            scheduled_matches.append(
                MatchPosition(
                    match=match_pos.match.copy(update={'court_id': body.new_court_id}),
                    position=body.new_position + offset,
                )
            )
        else:
            scheduled_matches.append(match_pos)

    await reorder_matches_for_court(tournament, scheduled_matches, body.new_court_id)

    if body.new_court_id != body.old_court_id:
        await reorder_matches_for_court(tournament, scheduled_matches, body.old_court_id)


async def update_start_times_of_matches(tournament_id: int) -> None:
    stages = await get_full_tournament_details(tournament_id)
    tournament = await sql_get_tournament(tournament_id)
    courts = await get_all_courts_in_tournament(tournament_id)
    scheduled_matches = [
        MatchPosition(match=match, position=float(assert_some(match.position_in_schedule)))
        for stage in stages
        for stage_item in stage.stage_items
        for round_ in stage_item.rounds
        for match in round_.matches
        if match.start_time is not None
    ]
    for court in courts:
        await reorder_matches_for_court(tournament, scheduled_matches, assert_some(court.id))
