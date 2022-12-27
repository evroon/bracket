from fastapi import APIRouter, Depends

from bracket.models.db.user import UserPublic
from bracket.routes.auth import get_current_user
from bracket.routes.models import UpcomingMatchesResponse

router = APIRouter()


@router.get("/tournaments/{tournament_id}/upcoming_matches", response_model=UpcomingMatchesResponse)
async def get_matches_to_schedule(
    tournament_id: int, _: UserPublic = Depends(get_current_user)
) -> UpcomingMatchesResponse:
    return UpcomingMatchesResponse(data=[])
