from fastapi import HTTPException
from starlette import status

from bracket.database import database
from bracket.models.db.match import Match
from bracket.models.db.round import Round, RoundWithMatches
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.schema import matches, rounds, teams
from bracket.sql.rounds import get_stages_with_rounds_and_matches
from bracket.sql.teams import get_teams_with_members
from bracket.utils.db import fetch_one_parsed


async def round_dependency(tournament_id: int, round_id: int) -> Round:
    round_ = await fetch_one_parsed(
        database,
        Round,
        rounds.select().where(rounds.c.id == round_id and matches.c.tournament_id == tournament_id),
    )

    if round_ is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find round with id {round_id}",
        )

    return round_


async def round_with_matches_dependency(tournament_id: int, round_id: int) -> RoundWithMatches:
    stages_ = await get_stages_with_rounds_and_matches(
        tournament_id, no_draft_rounds=False, round_id=round_id
    )

    if len(stages_) < 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find round with id {round_id}",
        )

    return stages_[0].rounds[0]


async def match_dependency(tournament_id: int, match_id: int) -> Match:
    match = await fetch_one_parsed(
        database,
        Match,
        matches.select().where(
            matches.c.id == match_id and matches.c.tournament_id == tournament_id
        ),
    )

    if match is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find match with id {match_id}",
        )

    return match


async def team_dependency(tournament_id: int, team_id: int) -> Team:
    team = await fetch_one_parsed(
        database,
        Team,
        teams.select().where(teams.c.id == team_id and teams.c.tournament_id == tournament_id),
    )

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find team with id {team_id}",
        )

    return team


async def team_with_players_dependency(tournament_id: int, team_id: int) -> FullTeamWithPlayers:
    teams_with_members = await get_teams_with_members(tournament_id, team_id=team_id)

    if len(teams_with_members) < 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find team with id {team_id}",
        )

    return teams_with_members[0]
