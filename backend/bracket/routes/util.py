from fastapi import HTTPException
from starlette import status

from bracket.database import database
from bracket.models.db.match import Match
from bracket.models.db.round import Round
from bracket.models.db.team import FullTeamWithPlayers, Team
from bracket.models.db.util import RoundWithMatches, StageItemWithRounds, StageWithStageItems
from bracket.schema import matches, rounds, teams
from bracket.sql.rounds import get_round_by_id
from bracket.sql.stage_items import get_stage_item
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.teams import get_teams_with_members
from bracket.utils.db import fetch_one_parsed
from bracket.utils.id_types import MatchId, RoundId, StageId, StageItemId, TeamId, TournamentId


async def round_dependency(tournament_id: TournamentId, round_id: RoundId) -> Round:
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


async def round_with_matches_dependency(
    tournament_id: TournamentId, round_id: RoundId
) -> RoundWithMatches:
    round_ = await get_round_by_id(tournament_id, round_id)
    if round_ is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find round with id {round_id}",
        )

    return round_


async def stage_dependency(tournament_id: TournamentId, stage_id: StageId) -> StageWithStageItems:
    stages = await get_full_tournament_details(
        tournament_id, no_draft_rounds=False, stage_id=stage_id
    )

    if len(stages) < 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find stage with id {stage_id}",
        )

    return stages[0]


async def stage_item_dependency(
    tournament_id: TournamentId, stage_item_id: StageItemId
) -> StageItemWithRounds:
    stage_item = await get_stage_item(tournament_id, stage_item_id=stage_item_id)

    if stage_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find stage item with id {stage_item_id}",
        )

    return stage_item


async def match_dependency(tournament_id: TournamentId, match_id: MatchId) -> Match:
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


async def team_dependency(tournament_id: TournamentId, team_id: TeamId) -> Team:
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


async def team_with_players_dependency(
    tournament_id: TournamentId, team_id: TeamId
) -> FullTeamWithPlayers:
    teams_with_members = await get_teams_with_members(tournament_id, team_id=team_id)

    if len(teams_with_members) < 1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Could not find team with id {team_id}",
        )

    return teams_with_members[0]
