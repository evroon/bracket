from bracket.sql.clubs import get_clubs_for_user_id, sql_delete_club
from bracket.utils.dummy_records import DUMMY_MOCK_TIME
from bracket.utils.http import HTTPMethod
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import send_auth_request
from tests.integration_tests.models import AuthContext


async def test_clubs_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(HTTPMethod.GET, 'clubs', auth_context, {}) == {
        'data': [
            {
                'created': DUMMY_MOCK_TIME.isoformat(),
                'id': 1,
                'name': 'Some Cool Club',
            }
        ],
    }


async def test_create_club(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    payload = {'name': 'Some Cool Club'}
    response = await send_auth_request(HTTPMethod.POST, 'clubs', auth_context, json=payload)
    user_id = assert_some(auth_context.user.id)

    clubs = await get_clubs_for_user_id(user_id)
    club_id = response['data']['id']  # type: ignore[call-overload]

    # await sql_remove_user_from_club(club_id, user_id)
    await sql_delete_club(club_id)

    assert len(clubs) == 2
    assert response['data']['name'] == payload['name']  # type: ignore[call-overload]
