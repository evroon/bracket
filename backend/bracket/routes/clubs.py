from fastapi import APIRouter, Depends

from bracket.logic.subscriptions import check_requirement
from bracket.models.db.club import ClubCreateBody, ClubUpdateBody
from bracket.models.db.user import UserPublic
from bracket.routes.auth import user_authenticated, user_authenticated_for_club
from bracket.routes.models import ClubResponse, ClubsResponse, SuccessResponse
from bracket.sql.clubs import create_club, get_clubs_for_user_id, sql_delete_club, sql_update_club
from bracket.utils.errors import ForeignKey, check_foreign_key_violation
from bracket.utils.id_types import ClubId
from bracket.utils.types import assert_some

router = APIRouter()


@router.get("/clubs", response_model=ClubsResponse)
async def get_clubs(user: UserPublic = Depends(user_authenticated)) -> ClubsResponse:
    return ClubsResponse(data=await get_clubs_for_user_id(assert_some(user.id)))


@router.post("/clubs", response_model=ClubResponse)
async def create_new_club(
    club: ClubCreateBody, user: UserPublic = Depends(user_authenticated)
) -> ClubResponse:
    existing_clubs = await get_clubs_for_user_id(assert_some(user.id))
    check_requirement(existing_clubs, user, "max_clubs")
    return ClubResponse(data=await create_club(club, assert_some(user.id)))


@router.delete("/clubs/{club_id}", response_model=SuccessResponse)
async def delete_club(
    club_id: ClubId, _: UserPublic = Depends(user_authenticated_for_club)
) -> SuccessResponse:
    with check_foreign_key_violation({ForeignKey.tournaments_club_id_fkey}):
        await sql_delete_club(club_id)

    return SuccessResponse()


@router.put("/clubs/{club_id}", response_model=ClubResponse)
async def update_club(
    club_id: ClubId, club: ClubUpdateBody, _: UserPublic = Depends(user_authenticated_for_club)
) -> ClubResponse:
    return ClubResponse(data=await sql_update_club(club_id, club))
