from fastapi import APIRouter, Depends, HTTPException
from heliclockter import datetime_utc
from starlette import status

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.models.db.team import FullTeamWithPlayers, Team, TeamBody, TeamToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import SingleTeamResponse, SuccessResponse, TeamsWithPlayersResponse
from bracket.routes.util import team_dependency, team_with_players_dependency
from bracket.schema import players_x_teams, teams
from bracket.sql.stages import get_full_tournament_details
from bracket.sql.teams import get_team_by_id, get_teams_with_members
from bracket.utils.db import fetch_one_parsed
from bracket.utils.types import assert_some

router = APIRouter()


async def update_team_members(team_id: int, tournament_id: int, player_ids: list[int]) -> None:
    [team] = await get_teams_with_members(tournament_id, team_id=team_id)

    # Add members to the team
    for player_id in player_ids:
        if player_id not in team.player_ids:
            await database.execute(
                query=players_x_teams.insert(),
                values={'team_id': team_id, 'player_id': player_id},
            )

    # Remove old members from the team
    await database.execute(
        query=players_x_teams.delete().where(
            (players_x_teams.c.player_id.not_in(player_ids))  # type: ignore[attr-defined]
            & (players_x_teams.c.team_id == team_id)
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)


@router.get("/tournaments/{tournament_id}/teams", response_model=TeamsWithPlayersResponse)
async def get_teams(
    tournament_id: int, _: UserPublic = Depends(user_authenticated_or_public_dashboard)
) -> TeamsWithPlayersResponse:
    return TeamsWithPlayersResponse.parse_obj({'data': await get_teams_with_members(tournament_id)})


@router.put("/tournaments/{tournament_id}/teams/{team_id}", response_model=SingleTeamResponse)
async def update_team_by_id(
    tournament_id: int,
    team_body: TeamBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    team: Team = Depends(team_dependency),
) -> SingleTeamResponse:
    await database.execute(
        query=teams.update().where(
            (teams.c.id == team.id) & (teams.c.tournament_id == tournament_id)
        ),
        values=team_body.dict(exclude={'player_ids'}),
    )
    await update_team_members(assert_some(team.id), tournament_id, team_body.player_ids)
    await recalculate_elo_for_tournament_id(tournament_id)

    return SingleTeamResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Team,
                teams.select().where(
                    (teams.c.id == team.id) & (teams.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.delete("/tournaments/{tournament_id}/teams/{team_id}", response_model=SuccessResponse)
async def delete_team(
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    team: FullTeamWithPlayers = Depends(team_with_players_dependency),
) -> SuccessResponse:
    stages = await get_full_tournament_details(tournament_id, no_draft_rounds=False)
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                if team.id in round_.get_team_ids():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Could not delete team that participates in matches",
                    )

    if len(team.players):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not delete team that still has players in it",
        )

    await database.execute(
        query=teams.delete().where(
            teams.c.id == team.id and teams.c.tournament_id == tournament_id
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/teams", response_model=SingleTeamResponse)
async def create_team(
    team_to_insert: TeamBody,
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleTeamResponse:
    tournament_teams = await get_teams_with_members(tournament_id)
    for team in tournament_teams:
        if team.player_ids != [] and sorted(team.player_ids) == sorted(team_to_insert.player_ids):
            return SingleTeamResponse(data=team)

    last_record_id = await database.execute(
        query=teams.insert(),
        values=TeamToInsert(
            **team_to_insert.dict(exclude={'player_ids'}),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
        ).dict(),
    )
    await update_team_members(last_record_id, tournament_id, team_to_insert.player_ids)

    team_result = await get_team_by_id(last_record_id, tournament_id)
    assert team_result is not None
    return SingleTeamResponse(data=team_result)
