from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.models.db.team import Team, TeamBody, TeamToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import SingleTeamResponse, SuccessResponse, TeamsWithPlayersResponse
from bracket.schema import players, teams
from bracket.utils.db import fetch_one_parsed
from bracket.utils.sql import get_teams_with_members

router = APIRouter()


async def update_team_members(team_id: int, tournament_id: int, player_ids: list[int]) -> None:
    # Add members to the team
    for player_id in player_ids:
        await database.execute(
            query=players.update().where(
                (players.c.id == player_id) & (teams.c.tournament_id == tournament_id)
            ),
            values={'team_id': team_id},
        )

    # Remove old members from the team
    await database.execute(
        query=players.update().where(
            (players.c.id.not_in(player_ids)) & (players.c.team_id == team_id) & (teams.c.tournament_id == tournament_id)  # type: ignore[attr-defined]
        ),
        values={'team_id': None},
    )
    await recalculate_elo_for_tournament_id(tournament_id)


@router.get("/tournaments/{tournament_id}/teams", response_model=TeamsWithPlayersResponse)
async def get_teams(
    tournament_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> TeamsWithPlayersResponse:
    return await get_teams_with_members(tournament_id)


@router.patch("/tournaments/{tournament_id}/teams/{team_id}", response_model=SingleTeamResponse)
async def update_team_by_id(
    tournament_id: int,
    team_id: int,
    team_body: TeamBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleTeamResponse:
    await database.execute(
        query=teams.update().where(
            (teams.c.id == team_id) & (teams.c.tournament_id == tournament_id)
        ),
        values=team_body.dict(exclude={'player_ids'}),
    )
    await update_team_members(team_id, tournament_id, team_body.player_ids)

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
    tournament_id: int, team_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    await database.execute(
        query=teams.delete().where(
            teams.c.id == team_id and teams.c.tournament_id == tournament_id
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
    last_record_id = await database.execute(
        query=teams.insert(),
        values=TeamToInsert(
            **team_to_insert.dict(exclude={'player_ids'}),
            created=datetime_utc.now(),
            tournament_id=tournament_id
        ).dict(),
    )
    await update_team_members(last_record_id, tournament_id, team_to_insert.player_ids)
    return SingleTeamResponse(
        data=await fetch_one_parsed(
            database, Team, teams.select().where(teams.c.id == last_record_id)
        )
    )
