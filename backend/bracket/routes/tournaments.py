from fastapi import APIRouter, Depends, HTTPException, UploadFile
from heliclockter import datetime_utc
from starlette import status

from bracket.database import database
from bracket.models.db.tournament import (
    Tournament,
    TournamentBody,
    TournamentToInsert,
    TournamentUpdateBody,
)
from bracket.models.db.user import UserPublic
from bracket.routes.auth import (
    user_authenticated,
    user_authenticated_for_tournament,
    user_authenticated_or_public_dashboard,
    user_authenticated_or_public_dashboard_by_endpoint_name,
)
from bracket.routes.models import SuccessResponse, TournamentResponse, TournamentsResponse
from bracket.schema import tournaments
from bracket.sql.tournaments import sql_get_tournament_by_endpoint_name, sql_get_tournaments
from bracket.sql.users import get_user_access_to_club, get_which_clubs_has_user_access_to
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.types import assert_some

router = APIRouter()
unauthorized_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="You don't have access to this tournament",
    headers={"WWW-Authenticate": "Bearer"},
)


@router.get("/tournaments/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(
    tournament_id: int, user: UserPublic | None = Depends(user_authenticated_or_public_dashboard)
) -> TournamentResponse:
    tournament = await fetch_one_parsed_certain(
        database, Tournament, tournaments.select().where(tournaments.c.id == tournament_id)
    )
    if user is None and not tournament.dashboard_public:
        raise unauthorized_exception

    return TournamentResponse(data=tournament)


@router.get("/tournaments", response_model=TournamentsResponse)
async def get_tournaments(
    user: UserPublic | None = Depends(user_authenticated_or_public_dashboard_by_endpoint_name),
    endpoint_name: str | None = None,
) -> TournamentsResponse:
    match user, endpoint_name:
        case None, None:
            raise unauthorized_exception

        case _, str(endpoint_name):
            return TournamentsResponse(
                data=[await sql_get_tournament_by_endpoint_name(endpoint_name)]
            )

        case _, _ if isinstance(user, UserPublic):
            user_club_ids = await get_which_clubs_has_user_access_to(assert_some(user.id))
            return TournamentsResponse(
                data=await sql_get_tournaments(tuple(user_club_ids), endpoint_name)
            )

    raise RuntimeError()


@router.put("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def update_tournament_by_id(
    tournament_id: int,
    tournament_body: TournamentUpdateBody,
    _: UserPublic = Depends(user_authenticated_for_tournament),
) -> SuccessResponse:
    await database.execute(
        query=tournaments.update().where(tournaments.c.id == tournament_id),
        values=tournament_body.dict(),
    )
    return SuccessResponse()


@router.delete("/tournaments/{tournament_id}", response_model=SuccessResponse)
async def delete_tournament(
    tournament_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    await database.execute(
        query=tournaments.delete().where(
            tournaments.c.id == tournament_id and tournaments.c.tournament_id == tournament_id
        ),
    )
    return SuccessResponse()


@router.post("/tournaments", response_model=SuccessResponse)
async def create_tournament(
    tournament_to_insert: TournamentBody, user: UserPublic = Depends(user_authenticated)
) -> SuccessResponse:
    has_access_to_club = await get_user_access_to_club(
        tournament_to_insert.club_id, assert_some(user.id)
    )
    if not has_access_to_club:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Club ID is invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await database.execute(
        query=tournaments.insert(),
        values=TournamentToInsert(
            **tournament_to_insert.dict(),
            created=datetime_utc.now(),
        ).dict(),
    )
    return SuccessResponse()


@router.post("/tournaments/{tournament_id}/logo")
async def create_upload_logo(
    file: UploadFile, tournament_id: int, _: UserPublic = Depends(user_authenticated_for_tournament)
) -> SuccessResponse:
    contents = await file.read()
    with open(f'static/{file.filename}', 'wb') as f:
        f.write(contents)

    await database.execute(
        tournaments.update().where(tournaments.c.id == tournament_id),
        values={'logo_path': file.filename},
    )
    return SuccessResponse()
