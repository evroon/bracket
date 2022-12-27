from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TEAM1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_team


async def test_teams_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1) as team_inserted:
        assert await send_tournament_request(HTTPMethod.GET, 'teams', auth_context, {}) == {
            'data': [
                {
                    'active': True,
                    'created': DUMMY_MOCK_TIME.isoformat(),
                    'id': team_inserted.id,
                    'name': 'Team 1',
                    'players': [],
                    'tournament_id': 1,
                }
            ],
        }
