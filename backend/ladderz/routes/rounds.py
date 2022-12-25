from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from ladderz.database import database
from ladderz.models.db.round import RoundBody, RoundToInsert, RoundWithMatches
from ladderz.models.db.user import UserPublic
from ladderz.routes.auth import get_current_user
from ladderz.routes.models import RoundsWithMatchesResponse, SuccessResponse
from ladderz.schema import rounds
from ladderz.utils.db import get_next_round_name

router = APIRouter()


@router.get("/tournaments/{tournament_id}/rounds", response_model=RoundsWithMatchesResponse)
async def get_matches_to_schedule(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> RoundsWithMatchesResponse:
    query = '''
        WITH teams_with_players AS (
            SELECT DISTINCT ON (teams.id)
                teams.*,
                to_json(array_agg(p)) as players
            FROM teams
            LEFT JOIN players p on p.team_id = teams.id
            WHERE teams.tournament_id = :tournament_id
            GROUP BY teams.id
        ), matches_with_teams AS (
            SELECT DISTINCT ON (matches.id)
                matches.*,
                to_json(t1) as team1,
                to_json(t2) as team2
            FROM matches
            LEFT JOIN teams_with_players t1 on t1.id = matches.team1_id
            LEFT JOIN teams_with_players t2 on t2.id = matches.team2_id
            LEFT JOIN rounds r on matches.round_id = r.id
            WHERE r.tournament_id = :tournament_id
        )
        SELECT rounds.*, to_json(array_agg(m.*)) AS matches FROM rounds
        LEFT JOIN matches_with_teams m on rounds.id = m.round_id
        WHERE rounds.tournament_id = :tournament_id
        GROUP BY rounds.id
    '''
    result = await database.fetch_all(query=query, values={'tournament_id': tournament_id})
    return RoundsWithMatchesResponse.parse_obj(
        {'data': [RoundWithMatches.parse_obj(x._mapping) for x in result]}
    )


@router.delete("/tournaments/{tournament_id}/rounds/{round_id}", response_model=SuccessResponse)
async def delete_round(
    tournament_id: int, round_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=rounds.delete().where(
            rounds.c.id == round_id and rounds.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/rounds", response_model=SuccessResponse)
async def create_round(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> SuccessResponse:
    await database.execute(
        query=rounds.insert(),
        values=RoundToInsert(
            created=datetime_utc.now(),
            tournament_id=tournament_id,
            name=await get_next_round_name(database, tournament_id),
        ).dict(),
    )
    return SuccessResponse()


@router.patch("/tournaments/{tournament_id}/rounds/{round_id}", response_model=SuccessResponse)
async def update_round_by_id(
    tournament_id: int,
    round_id: int,
    round_body: RoundBody,
    _: UserPublic = Depends(get_current_user),
) -> SuccessResponse:
    values = {'tournament_id': tournament_id, 'round_id': round_id}
    query = '''
        UPDATE rounds
        SET
            is_draft =
                CASE WHEN rounds.id=:round_id THEN :is_draft
                     ELSE is_draft AND NOT :is_draft
                END,
            is_active =
                CASE WHEN rounds.id=:round_id THEN :is_active
                     ELSE is_active AND NOT :is_active
                END
        WHERE rounds.tournament_id = :tournament_id
    '''
    await database.execute(
        query=query,
        values={**values, 'is_active': round_body.is_active, 'is_draft': round_body.is_draft},
    )
    query = '''
        UPDATE rounds
        SET name = :name
        WHERE rounds.tournament_id = :tournament_id
        AND rounds.id = :round_id
    '''
    await database.execute(query=query, values={**values, 'name': round_body.name})
    return SuccessResponse()
