from bracket.models.db.match import Match, MatchCreateBody
from bracket.sql.courts import get_all_free_courts_in_round
from bracket.sql.matches import sql_create_match
from bracket.sql.tournaments import sql_get_tournament


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
