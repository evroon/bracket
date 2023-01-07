from bracket.utils.dummy_records import DUMMY_ROUND1, DUMMY_TEAM1, DUMMY_PLAYER1, DUMMY_TEAM2
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_round, inserted_team, inserted_player


async def test_upcoming_matches_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_round(
        DUMMY_ROUND1.copy(update={'tournament_id': auth_context.tournament.id, 'is_draft': True})
    ):
        async with inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team1_inserted:
            async with inserted_team(
                DUMMY_TEAM2.copy(update={'tournament_id': auth_context.tournament.id})
            ) as team2_inserted:
                json_response = await send_tournament_request(
                    HTTPMethod.GET, 'upcoming_matches', auth_context, {}
                )
                assert json_response == {
                    'data': [
                        {
                            'team1': {
                                'id': team1_inserted.id,
                                'created': '2022-01-11T04:32:11+00:00',
                                'name': team1_inserted.name,
                                'tournament_id': auth_context.tournament.id,
                                'active': True,
                                'players': [],
                            },
                            'team2': {
                                'id': team2_inserted.id,
                                'created': '2022-01-11T04:32:11+00:00',
                                'name': team2_inserted.name,
                                'tournament_id': auth_context.tournament.id,
                                'active': True,
                                'players': [],
                            },
                            'elo_diff': 0.0,
                            'swiss_diff': 0.0,
                        }
                    ]
                }
