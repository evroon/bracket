from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TEAM1, DUMMY_PLAYER1, DUMMY_ROUND1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_team, inserted_player, inserted_round


async def test_rounds_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_round(DUMMY_ROUND1) as round_inserted:
            assert await send_tournament_request(HTTPMethod.GET, 'rounds', auth_context, {}) == {
                'data': [
                    {
                        'created': DUMMY_MOCK_TIME.isoformat(),
                        'id': round_inserted.id,
                        'is_active': False,
                        'is_draft': False,
                        'matches': [],
                        'name': 'Round 1',
                        'tournament_id': 1,
                    }
                ],
            }
