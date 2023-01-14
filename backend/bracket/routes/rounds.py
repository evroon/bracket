from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.models.db.round import Round, RoundBody, RoundToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import RoundsWithMatchesResponse, SuccessResponse
from bracket.routes.util import round_dependency
from bracket.schema import rounds
from bracket.utils.db import fetch_one_parsed
from bracket.utils.sql import get_next_round_name, get_rounds_with_matches

router = APIRouter()


@router.get("/tournaments/{tournament_id}/rounds", response_model=RoundsWithMatchesResponse)
async def get_rounds(
    tournament_id: int,
    user: UserPublic = Depends(user_authenticated_or_public_dashboard),
    no_draft_rounds: bool = False,
) -> RoundsWithMatchesResponse:
    rounds = await get_rounds_with_matches(
        tournament_id, no_draft_rounds=user is None or no_draft_rounds
    )
    if user is not None:
        return rounds

    return RoundsWithMatchesResponse(data=[round_ for round_ in rounds.data if not round_.is_draft])


@router.delete("/tournaments/{tournament_id}/rounds/{round_id}", response_model=SuccessResponse)
async def delete_round(
    tournament_id: int,
    round_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round: Round = Depends(round_dependency),
) -> SuccessResponse:
    await database.execute(
        query=rounds.delete().where(
            rounds.c.id == round_id and rounds.c.tournament_id == tournament_id
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/rounds", response_model=SuccessResponse)
async def create_round(
    tournament_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
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
    _: UserPublic = Depends(user_authenticated_for_tournament),
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
