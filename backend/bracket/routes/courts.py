from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.court import Court, CourtBody, CourtToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated_for_tournament
from bracket.routes.models import CourtsResponse, SingleCourtResponse, SuccessResponse
from bracket.schema import courts
from bracket.sql.courts import get_all_courts_in_tournament, update_court
from bracket.utils.db import fetch_one_parsed
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/tournaments/{tournament_id}/courts", response_model=CourtsResponse)
async def get_courts(
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> CourtsResponse:
    return CourtsResponse(data=await get_all_courts_in_tournament(tournament_id))


@router.patch("/tournaments/{tournament_id}/courts/{court_id}", response_model=SingleCourtResponse)
async def update_court_by_id(
    tournament_id: int,
    court_id: int,
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
    tournament_id: int, court_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    await database.execute(
        query=courts.delete().where(
            courts.c.id == court_id and courts.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/courts", response_model=SingleCourtResponse)
async def create_court(
    court_body: CourtBody,
    tournament_id: int,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SingleCourtResponse:
    last_record_id = await database.execute(
        query=courts.insert(),
        values=CourtToInsert(
            **court_body.dict(),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
        ).dict(),
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
