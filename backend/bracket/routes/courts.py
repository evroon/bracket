from fastapi import APIRouter, Depends, HTTPException
from heliclockter import datetime_utc
from starlette import status

from bracket.database import database
from bracket.logic.subscriptions import check_requirement
from bracket.models.db.court import Court, CourtBody, CourtToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import CourtsResponse, SingleCourtResponse, SuccessResponse
from bracket.schema import courts
from bracket.sql.courts import get_all_courts_in_tournament, sql_delete_court, update_court
from bracket.sql.stages import get_full_tournament_details
from bracket.utils.db import fetch_one_parsed
from bracket.utils.id_types import CourtId, TournamentId
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/tournaments/{tournament_id}/courts", response_model=CourtsResponse)
async def get_courts(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_or_public_dashboard),
) -> CourtsResponse:
    return CourtsResponse(data=await get_all_courts_in_tournament(tournament_id))


@router.put("/tournaments/{tournament_id}/courts/{court_id}", response_model=SingleCourtResponse)
async def update_court_by_id(
    tournament_id: TournamentId,
    court_id: CourtId,
    court_body: CourtBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleCourtResponse:
    await update_court(
        tournament_id=tournament_id,
        court_id=court_id,
        court_body=court_body,
    )
    return SingleCourtResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Court,
                courts.select().where(
                    (courts.c.id == court_id) & (courts.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.delete("/tournaments/{tournament_id}/courts/{court_id}", response_model=SuccessResponse)
async def delete_court(
    tournament_id: TournamentId,
    court_id: CourtId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    stages = await get_full_tournament_details(tournament_id, no_draft_rounds=False)
    used_in_matches_count = 0
    for stage in stages:
        for stage_item in stage.stage_items:
            for round_ in stage_item.rounds:
                for match in round_.matches:
                    if match.court_id == court_id:
                        used_in_matches_count += 1

    if used_in_matches_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not delete court since it's used by {used_in_matches_count} matches",
        )

    await sql_delete_court(tournament_id, court_id)
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/courts", response_model=SingleCourtResponse)
async def create_court(
    court_body: CourtBody,
    tournament_id: TournamentId,
    user: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleCourtResponse:
    existing_courts = await get_all_courts_in_tournament(tournament_id)
    check_requirement(existing_courts, user, "max_courts")

    last_record_id = await database.execute(
        query=courts.insert(),
        values=CourtToInsert(
            **court_body.model_dump(),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
        ).model_dump(),
    )
    return SingleCourtResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                Court,
                courts.select().where(
                    courts.c.id == last_record_id and courts.c.tournament_id == tournament_id
                ),
            )
        )
    )
