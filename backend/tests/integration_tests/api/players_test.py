from bracket.utils.dummy_records import DUMMY_MOCK_TIME, DUMMY_TEAM1, DUMMY_PLAYER1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_team, inserted_player


async def test_players_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_team(DUMMY_TEAM1):
        async with inserted_player(DUMMY_PLAYER1) as player_inserted:
            assert await send_tournament_request(HTTPMethod.GET, 'players', auth_context, {}) == {
                'data': [
                    {
                        'created': DUMMY_MOCK_TIME.isoformat(),
                        'id': player_inserted.id,
                        'elo_score': 0.0,
                        'name': 'Luke',
                        'team_id': 1,
                        'tournament_id': 1,
                    }
                ],
            }
