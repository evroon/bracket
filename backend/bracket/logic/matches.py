from heliclockter import datetime_utc, timedelta

from bracket.models.db.match import Match, MatchCreateBody
from bracket.sql.courts import get_all_courts_in_tournament, get_all_free_courts_in_round
from bracket.sql.matches import sql_create_match, sql_update_court_id_and_start_time_for_match
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
            last_match = matches_per_court[court_id][-1]
            start_time = assert_some(last_match.start_time) + timedelta(minutes=15)
        except IndexError:
            start_time = now

        await sql_update_court_id_and_start_time_for_match(
            assert_some(match.id), court_id, start_time
        )

        matches_per_court[court_id].append(match.copy(update={'start_time': start_time}))
        match_count_per_court[court_id] += 1
