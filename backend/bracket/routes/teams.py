from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.player import Player
from bracket.models.db.team import Team, TeamBody, TeamToInsert, TeamWithPlayers
from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import (
    SingleTeamResponse,
    SuccessResponse,
    TeamsResponse,
    TeamsWithPlayersResponse,
)
from bracket.schema import players, teams
from bracket.utils.db import fetch_all_parsed, fetch_one_parsed

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


@router.get("/tournaments/{tournament_id}/teams", response_model=TeamsWithPlayersResponse)
async def get_teams(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> TeamsWithPlayersResponse:
    query = '''
        SELECT teams.*, to_json(array_agg(players.*)) AS players
        FROM teams
        LEFT JOIN players ON players.team_id = teams.id
        WHERE teams.tournament_id = :tournament_id
        GROUP BY teams.id;
        '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return TeamsWithPlayersResponse.parse_obj(
        {'data': [TeamWithPlayers.parse_obj(x._mapping) for x in result]}
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
    print(team_to_insert.dict(exclude={'player_ids'}))
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
