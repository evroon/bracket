from bracket.utils.dummy_records import DUMMY_MOCK_TIME
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_auth_request
from tests.integration_tests.models import AuthContext


async def test_tournaments_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(HTTPMethod.GET, 'tournaments', auth_context, {}) == {
        'data': [
            {
                'id': auth_context.tournament.id,
                'club_id': auth_context.club.id,
                'created': DUMMY_MOCK_TIME.isoformat(),
                'name': 'Some Cool Tournament',
                'dashboard_public': True,
            }
        ],
    }
