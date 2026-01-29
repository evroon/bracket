from fastapi import APIRouter, Depends
from heliclockter import datetime_utc

from bracket.config import config
from bracket.database import database
from bracket.models.db.tournament import Tournament
from bracket.models.db.tournament_break import TournamentBreak, TournamentBreakBody, TournamentBreakToInsert
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
)
from bracket.routes.models import SingleTournamentBreakResponse, SuccessResponse, TournamentBreaksResponse
from bracket.routes.util import disallow_archived_tournament
from bracket.schema import tournament_breaks
from bracket.sql.tournament_breaks import get_all_breaks_in_tournament, sql_delete_break, update_break
from bracket.utils.db import fetch_one_parsed
from bracket.utils.id_types import BreakId, TournamentId
from bracket.utils.types import assert_some

router = APIRouter(prefix=config.api_prefix)


@router.get("/tournaments/{tournament_id}/breaks", response_model=TournamentBreaksResponse)
async def get_breaks(
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_or_public_dashboard),
) -> TournamentBreaksResponse:
    return TournamentBreaksResponse(data=await get_all_breaks_in_tournament(tournament_id))


@router.put(
    "/tournaments/{tournament_id}/breaks/{break_id}",
    response_model=SingleTournamentBreakResponse,
)
async def update_break_by_id(
    tournament_id: TournamentId,
    break_id: BreakId,
    break_body: TournamentBreakBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SingleTournamentBreakResponse:
    await update_break(
        tournament_id=tournament_id,
        break_id=break_id,
        break_body=break_body,
    )
    return SingleTournamentBreakResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                TournamentBreak,
                tournament_breaks.select().where(
                    (tournament_breaks.c.id == break_id)
                    & (tournament_breaks.c.tournament_id == tournament_id)
                ),
            )
        )
    )


@router.delete(
    "/tournaments/{tournament_id}/breaks/{break_id}",
    response_model=SuccessResponse,
)
async def delete_break(
    tournament_id: TournamentId,
    break_id: BreakId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SuccessResponse:
    await sql_delete_break(tournament_id, break_id)
    return SuccessResponse()


@router.post(
    "/tournaments/{tournament_id}/breaks",
    response_model=SingleTournamentBreakResponse,
)
async def create_break(
    break_body: TournamentBreakBody,
    tournament_id: TournamentId,
    _: UserPublic = Depends(user_authenticated_for_tournament),
    __: Tournament = Depends(disallow_archived_tournament),
) -> SingleTournamentBreakResponse:
    last_record_id = await database.execute(
        query=tournament_breaks.insert(),
        values=TournamentBreakToInsert(
            **break_body.model_dump(),
            created=datetime_utc.now(),
            tournament_id=tournament_id,
        ).model_dump(),
    )
    return SingleTournamentBreakResponse(
        data=assert_some(
            await fetch_one_parsed(
                database,
                TournamentBreak,
                tournament_breaks.select().where(
                    tournament_breaks.c.id == last_record_id
                    and tournament_breaks.c.tournament_id == tournament_id
                ),
            )
        )
    )
