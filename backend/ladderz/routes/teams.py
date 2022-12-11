from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from ladderz.database import database
from ladderz.models.db.team import Team, TeamBody, TeamToInsert
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import SingleTeamResponse, SuccessResponse, TeamsResponse
from ladderz.schema import players, teams
from ladderz.utils.db import fetch_all_parsed, fetch_one_parsed

router = APIRouter()


@router.get("/tournaments/{tournament_id}/teams", response_model=TeamsResponse)
async def get_teams(tournament_id: int, _: UserPublic = Depends(get_current_user)) -> TeamsResponse:
    return TeamsResponse(
        data=await fetch_all_parsed(
            database, Team, teams.select().where(teams.c.tournament_id == tournament_id)
        )
    )


@router.patch("/tournaments/{tournament_id}/teams/{team_id}", response_model=SingleTeamResponse)
async def update_team_by_id(
    tournament_id: int,
    team_id: int,
    team_body: TeamBody,
    _: UserPublic = Depends(get_current_user),
) -> SingleTeamResponse:
    await database.execute(
        query=teams.update().where(
            (teams.c.id == team_id) & (teams.c.tournament_id == tournament_id)
        ),
        values=team_body.dict(),
    )
    return SingleTeamResponse(
        data=await fetch_one_parsed(
            database,
            Team,
            teams.select().where(
                (teams.c.id == team_id) & (teams.c.tournament_id == tournament_id)
            ),
        )
    )


@router.delete("/tournaments/{tournament_id}/teams/{team_id}", response_model=SuccessResponse)
async def delete_team(
    tournament_id: int, team_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=teams.delete().where(
            teams.c.id == team_id and teams.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/teams", response_model=SingleTeamResponse)
async def create_team(
    team_to_insert: TeamBody, tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> SingleTeamResponse:
    last_record_id = await database.execute(
        query=teams.insert(),
        values=TeamToInsert(
            **team_to_insert.dict(), created=datetime_utc.now(), tournament_id=tournament_id
        ).dict(),
    )
    return SingleTeamResponse(
        data=await fetch_one_parsed(
            database, Team, teams.select().where(teams.c.id == last_record_id)
        )
    )
