from fastapi import APIRouter, Depends, HTTPException
from heliclockter import datetime_utc
from starlette import status

from bracket.database import database
from bracket.logic.elo import recalculate_elo_for_tournament_id
from bracket.models.db.round import (
    Round,
    RoundCreateBody,
    RoundToInsert,
    RoundUpdateBody,
    RoundWithMatches,
)
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import RoundsWithMatchesResponse, SuccessResponse
from bracket.routes.util import round_dependency, round_with_matches_dependency
from bracket.schema import rounds
from bracket.sql.rounds import get_next_round_name, get_rounds_with_matches

router = APIRouter()


@router.get("/tournaments/{tournament_id}/rounds", response_model=RoundsWithMatchesResponse)
async def get_rounds(
    tournament_id: int,
    user: UserPublic = Depends(user_authenticated_or_public_dashboard),
    no_draft_rounds: bool = False,
) -> RoundsWithMatchesResponse:
    rounds_ = await get_rounds_with_matches(
        tournament_id, no_draft_rounds=user is None or no_draft_rounds
    )
    if user is not None:
        return RoundsWithMatchesResponse(data=rounds_)

    return RoundsWithMatchesResponse(data=[round_ for round_ in rounds_ if not round_.is_draft])


@router.delete("/tournaments/{tournament_id}/rounds/{round_id}", response_model=SuccessResponse)
async def delete_round(
    tournament_id: int,
    round_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round_with_matches: RoundWithMatches = Depends(round_with_matches_dependency),
) -> SuccessResponse:
    if len(round_with_matches.matches) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Round contains matches, delete those first",
        )

    await database.execute(
        query=rounds.delete().where(
            rounds.c.id == round_id and rounds.c.tournament_id == tournament_id
        ),
    )
    await recalculate_elo_for_tournament_id(tournament_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/rounds", response_model=SuccessResponse)
async def create_round(
    tournament_id: int,
    round_body: RoundCreateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await database.execute(
        query=rounds.insert(),
        values=RoundToInsert(
            created=datetime_utc.now(),
            stage_id=round_body.stage_id,
            name=await get_next_round_name(tournament_id, round_body.stage_id),
        ).dict(),
    )
    return SuccessResponse()


@router.patch("/tournaments/{tournament_id}/rounds/{round_id}", response_model=SuccessResponse)
async def update_round_by_id(
    tournament_id: int,
    round_id: int,
    round_body: RoundUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    round_: Round = Depends(round_dependency),  # pylint: disable=redefined-builtin
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
        WHERE rounds.id IN (
            SELECT rounds.id
            FROM rounds
            JOIN stages s on s.id = rounds.stage_id
            WHERE s.tournament_id = :tournament_id
        )
    '''
    await database.execute(
        query=query,
        values={**values, 'is_active': round_body.is_active, 'is_draft': round_body.is_draft},
    )
    query = '''
        UPDATE rounds
        SET name = :name
        WHERE rounds.id IN (
            SELECT rounds.id
            FROM rounds
            JOIN stages s on s.id = rounds.stage_id
            WHERE s.tournament_id = :tournament_id
        )
        AND rounds.id = :round_id
    '''
    await database.execute(query=query, values={**values, 'name': round_body.name})
    return SuccessResponse()
