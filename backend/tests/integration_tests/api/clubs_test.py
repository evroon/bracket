from bracket.models.db.user_x_club import UserXClub, UserXClubRelation
from bracket.sql.clubs import get_clubs_for_user_id, sql_delete_club
from bracket.utils.dummy_records import DUMMY_CLUB, DUMMY_MOCK_TIME
from bracket.utils.http import HTTPMethod
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import send_auth_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_club, inserted_user_x_club


async def test_clubs_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(HTTPMethod.GET, "clubs", auth_context, {}) == {
        "data": [
            {
                "created": DUMMY_MOCK_TIME.isoformat().replace("+00:00", "Z"),
                "id": auth_context.club.id,
                "name": "Some Cool Club",
            }
        ],
    }


async def test_create_club(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    payload = {"name": "Some Cool Club"}
    response = await send_auth_request(HTTPMethod.POST, "clubs", auth_context, json=payload)
    user_id = assert_some(auth_context.user.id)

    clubs = await get_clubs_for_user_id(user_id)
    club_id = response["data"]["id"]

    await sql_delete_club(club_id)

    assert len(clubs) == 2
    assert response["data"]["name"] == payload["name"]


async def test_delete_club(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_club(DUMMY_CLUB) as club_inserted:
        async with inserted_user_x_club(
            UserXClub(
                user_id=assert_some(auth_context.user.id),
                club_id=assert_some(club_inserted.id),
                relation=UserXClubRelation.OWNER,
            )
        ):
            response = await send_auth_request(
                HTTPMethod.DELETE, f"clubs/{club_inserted.id}", auth_context
            )
            assert response["success"] is True
