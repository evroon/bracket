from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_request
from tests.integration_tests.sql import AuthContext


async def test_teams_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_request(HTTPMethod.GET, f'tournaments/1/teams', {}, auth_context.headers) == {
        'data': []
    }
