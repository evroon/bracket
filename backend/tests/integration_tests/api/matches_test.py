from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext


async def test_upcoming_matches_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_tournament_request(HTTPMethod.GET, 'upcoming_matches', auth_context, {}) == {
        'data': []
    }
