from bracket.utils.dummy_records import (
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_ROUND1,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
)
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_player, inserted_round, inserted_team


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
                async with inserted_player(
                    DUMMY_PLAYER1.copy(update={'team_id': team1_inserted.id, 'elo_score': 12})
                ) as player1_inserted:
                    async with inserted_player(
                        DUMMY_PLAYER2.copy(update={'team_id': team2_inserted.id, 'elo_score': 10})
                    ) as player2_inserted:
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
                                        'players': [
                                            {
                                                'id': player1_inserted.id,
                                                'name': 'Luke',
                                                'created': '2022-01-11T04:32:11+00:00',
                                                'team_id': team1_inserted.id,
                                                'tournament_id': 1,
                                                'elo_score': 12,
                                                'swiss_score': 0,
                                                'wins': 0,
                                                'draws': 0,
                                                'losses': 0,
                                            }
                                        ],
                                    },
                                    'team2': {
                                        'id': team2_inserted.id,
                                        'created': '2022-01-11T04:32:11+00:00',
                                        'name': team2_inserted.name,
                                        'tournament_id': auth_context.tournament.id,
                                        'active': True,
                                        'players': [
                                            {
                                                'id': player2_inserted.id,
                                                'name': 'Anakin',
                                                'created': '2022-01-11T04:32:11+00:00',
                                                'team_id': team2_inserted.id,
                                                'tournament_id': 1,
                                                'elo_score': 10,
                                                'swiss_score': 0,
                                                'wins': 0,
                                                'draws': 0,
                                                'losses': 0,
                                            }
                                        ],
                                    },
                                    'elo_diff': 2.0,
                                    'swiss_diff': 0.0,
                                }
                            ]
                        }
