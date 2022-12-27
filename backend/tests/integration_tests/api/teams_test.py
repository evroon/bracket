from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_team


async def test_teams_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        assert await send_tournament_request(HTTPMethod.GET, 'teams', auth_context, {}) == {
            'data': [
                {
                    'active': True,
                    'created': DUMMY_MOCK_TIME.isoformat(),
                    'id': 1,
                    'name': 'Team 1',
                    'players': [],
                    'tournament_id': 1,
                }
            ],
        }
