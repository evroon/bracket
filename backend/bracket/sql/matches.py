from datetime import datetime

from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.match import Match, MatchBody, MatchCreateBody
from bracket.models.db.tournament import Tournament
from bracket.utils.id_types import CourtId, MatchId, StageItemId, TeamId


async def sql_delete_match(match_id: MatchId) -> None:
    query = """
        DELETE FROM matches
        WHERE matches.id = :match_id
        """
    await database.execute(query=query, values={"match_id": match_id})


async def sql_delete_matches_for_stage_item_id(stage_item_id: StageItemId) -> None:
    query = """
        DELETE FROM matches
        WHERE matches.id IN (
            SELECT matches.id
            FROM matches
            LEFT JOIN rounds ON matches.round_id = rounds.id
            WHERE rounds.stage_item_id = :stage_item_id
        )
        """
    await database.execute(query=query, values={"stage_item_id": stage_item_id})


async def sql_create_match(match: MatchCreateBody) -> Match:
    query = """
        INSERT INTO matches (
            round_id,
            court_id,
            team1_id,
            team2_id,
            team1_winner_from_stage_item_id,
            team2_winner_from_stage_item_id,
            team1_winner_position,
            team2_winner_position,
            team1_winner_from_match_id,
            team2_winner_from_match_id,
            duration_minutes,
            custom_duration_minutes,
            margin_minutes,
            custom_margin_minutes,
            team1_score,
            team2_score,
            created
        )
        VALUES (
            :round_id,
            :court_id,
            :team1_id,
            :team2_id,
            :team1_winner_from_stage_item_id,
            :team2_winner_from_stage_item_id,
            :team1_winner_position,
            :team2_winner_position,
            :team1_winner_from_match_id,
            :team2_winner_from_match_id,
            :duration_minutes,
            :custom_duration_minutes,
            :margin_minutes,
            :custom_margin_minutes,
            0,
            0,
            NOW()
        )
        RETURNING *
    """
    result = await database.fetch_one(query=query, values=match.model_dump())

    if result is None:
        raise ValueError("Could not create stage")

    return Match.model_validate(dict(result._mapping))


async def sql_update_match(match_id: MatchId, match: MatchBody, tournament: Tournament) -> None:
    query = """
        UPDATE matches
        SET round_id = :round_id,
            team1_score = :team1_score,
            team2_score = :team2_score,
            court_id = :court_id,
            custom_duration_minutes = :custom_duration_minutes,
            custom_margin_minutes = :custom_margin_minutes,
            duration_minutes = :duration_minutes,
            margin_minutes = :margin_minutes
        WHERE matches.id = :match_id
        RETURNING *
        """

    duration_minutes = (
        match.custom_duration_minutes
        if match.custom_duration_minutes is not None
        else tournament.duration_minutes
    )
    margin_minutes = (
        match.custom_margin_minutes
        if match.custom_margin_minutes is not None
        else tournament.margin_minutes
    )
    await database.execute(
        query=query,
        values={
            "match_id": match_id,
            **match.model_dump(),
            "duration_minutes": duration_minutes,
            "margin_minutes": margin_minutes,
        },
    )


async def sql_update_team_ids_for_match(
    match_id: MatchId, team1_id: TeamId | None, team2_id: TeamId | None = None
) -> None:
    query = """
        UPDATE matches
        SET team1_id = :team1_id,
            team2_id = :team2_id
        WHERE matches.id = :match_id
        """
    await database.execute(
        query=query, values={"match_id": match_id, "team1_id": team1_id, "team2_id": team2_id}
    )


async def sql_reschedule_match(
    match_id: MatchId,
    court_id: CourtId | None,
    start_time: datetime_utc,
    position_in_schedule: int | None,
    duration_minutes: int,
    margin_minutes: int,
    custom_duration_minutes: int | None,
    custom_margin_minutes: int | None,
) -> None:
    query = """
        UPDATE matches
        SET court_id = :court_id,
            start_time = :start_time,
            position_in_schedule = :position_in_schedule,
            duration_minutes = :duration_minutes,
            margin_minutes = :margin_minutes,
            custom_duration_minutes = :custom_duration_minutes,
            custom_margin_minutes = :custom_margin_minutes
        WHERE matches.id = :match_id
        """
    await database.execute(
        query=query,
        values={
            "court_id": court_id,
            "match_id": match_id,
            "position_in_schedule": position_in_schedule,
            "start_time": datetime.fromisoformat(start_time.isoformat()),
            "duration_minutes": duration_minutes,
            "margin_minutes": margin_minutes,
            "custom_duration_minutes": custom_duration_minutes,
            "custom_margin_minutes": custom_margin_minutes,
        },
    )


async def sql_reschedule_match_and_determine_duration_and_margin(
    match_id: MatchId,
    court_id: CourtId | None,
    start_time: datetime_utc,
    position_in_schedule: int | None,
    match: Match,
    tournament: Tournament,
) -> None:
    duration_minutes = (
        tournament.duration_minutes
        if match.custom_duration_minutes is None
        else match.custom_duration_minutes
    )
    margin_minutes = (
        tournament.margin_minutes
        if match.custom_margin_minutes is None
        else match.custom_margin_minutes
    )
    await sql_reschedule_match(
        match_id,
        court_id,
        start_time,
        position_in_schedule,
        duration_minutes,
        margin_minutes,
        match.custom_duration_minutes,
        match.custom_margin_minutes,
    )


async def sql_get_match(match_id: MatchId) -> Match:
    query = """
        SELECT *
        FROM matches
        WHERE matches.id = :match_id
        """
    result = await database.fetch_one(query=query, values={"match_id": match_id})

    if result is None:
        raise ValueError("Could not create stage")

    return Match.model_validate(dict(result._mapping))
