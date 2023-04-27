from bracket.database import database
from bracket.models.db.match import Match
from bracket.schema import matches
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.dummy_records import (
    DUMMY_MATCH1,
    DUMMY_PLAYER1,
    DUMMY_PLAYER2,
    DUMMY_PLAYER3,
    DUMMY_PLAYER4,
    DUMMY_ROUND1,
    DUMMY_STAGE1,
    DUMMY_TEAM1,
    DUMMY_TEAM2,
)
from bracket.utils.http import HTTPMethod
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import SUCCESS_RESPONSE, send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import (
    assert_row_count_and_clear,
    inserted_match,
    inserted_player_in_team,
    inserted_round,
    inserted_stage,
    inserted_team,
)


async def test_create_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
        inserted_round(DUMMY_ROUND1.copy(update={'stage_id': stage_inserted.id})) as round_inserted,
        inserted_team(DUMMY_TEAM1) as team1_inserted,
        inserted_team(DUMMY_TEAM2) as team2_inserted,
    ):
        body = {
            'team1_id': team1_inserted.id,
            'team2_id': team2_inserted.id,
            'round_id': round_inserted.id,
            'label': 'Some label',
        }
        assert (
            await send_tournament_request(HTTPMethod.POST, 'matches', auth_context, json=body)
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(matches, 1)


async def test_delete_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
        inserted_round(DUMMY_ROUND1.copy(update={'stage_id': stage_inserted.id})) as round_inserted,
        inserted_team(DUMMY_TEAM1) as team1_inserted,
        inserted_team(DUMMY_TEAM2) as team2_inserted,
        inserted_match(
            DUMMY_MATCH1.copy(
                update={
                    'round_id': round_inserted.id,
                    'team1_id': team1_inserted.id,
                    'team2_id': team2_inserted.id,
                }
            )
        ) as match_inserted,
    ):
        assert (
            await send_tournament_request(
                HTTPMethod.DELETE, f'matches/{match_inserted.id}', auth_context, {}
            )
            == SUCCESS_RESPONSE
        )
        await assert_row_count_and_clear(matches, 0)


async def test_update_match(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
        inserted_round(DUMMY_ROUND1.copy(update={'stage_id': stage_inserted.id})) as round_inserted,
        inserted_team(DUMMY_TEAM1) as team1_inserted,
        inserted_team(DUMMY_TEAM2) as team2_inserted,
        inserted_match(
            DUMMY_MATCH1.copy(
                update={
                    'round_id': round_inserted.id,
                    'team1_id': team1_inserted.id,
                    'team2_id': team2_inserted.id,
                }
            )
        ) as match_inserted,
    ):
        body = {
            'team1_score': 42,
            'team2_score': 24,
            'round_id': round_inserted.id,
            'label': 'Some label',
        }
        assert (
            await send_tournament_request(
                HTTPMethod.PATCH,
                f'matches/{match_inserted.id}',
                auth_context,
                None,
                body,
            )
            == SUCCESS_RESPONSE
        )
        patched_match = await fetch_one_parsed_certain(
            database,
            Match,
            query=matches.select().where(matches.c.id == round_inserted.id),
        )
        assert patched_match.team1_score == body['team1_score']
        assert patched_match.team2_score == body['team2_score']
        assert patched_match.label == body['label']

        await assert_row_count_and_clear(matches, 1)


async def test_upcoming_matches_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with (
        inserted_stage(DUMMY_STAGE1) as stage_inserted,
        inserted_round(
            DUMMY_ROUND1.copy(
                update={
                    'is_draft': True,
                    'stage_id': stage_inserted.id,
                }
            )
        ),
        inserted_team(
            DUMMY_TEAM1.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team1_inserted,
        inserted_team(
            DUMMY_TEAM2.copy(update={'tournament_id': auth_context.tournament.id})
        ) as team2_inserted,
        inserted_player_in_team(
            DUMMY_PLAYER1.copy(update={'elo_score': 1100}), assert_some(team1_inserted.id)
        ),
        inserted_player_in_team(
            DUMMY_PLAYER2.copy(update={'elo_score': 1300}),
            assert_some(team2_inserted.id),
        ),
        inserted_player_in_team(
            DUMMY_PLAYER3.copy(update={'elo_score': 1200}),
            assert_some(team1_inserted.id),
        ),
        inserted_player_in_team(
            DUMMY_PLAYER4.copy(update={'elo_score': 1400}),
            assert_some(team2_inserted.id),
        ),
    ):
        json_response = await send_tournament_request(
            HTTPMethod.GET, f'stages/{stage_inserted.id}/upcoming_matches', auth_context, {}
        )
        assert json_response == {
            'data': [
                {
                    'team1': {
                        'players': [
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
                {
                    'team1': {
                        'players': [
                            {
                                'id': 2,
                                'active': True,
                                'name': 'Anakin',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1300.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 3,
                                'active': True,
                                'name': 'Leia',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1200.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'team2': {
                        'players': [
                            {
                                'id': 4,
                                'active': True,
                                'name': 'Yoda',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1400.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                            {
                                'id': 1,
                                'active': True,
                                'name': 'Luke',
                                'created': '2022-01-11T04:32:11+00:00',
                                'tournament_id': 1,
                                'elo_score': 1100.0,
                                'swiss_score': 0.0,
                                'wins': 0,
                                'draws': 0,
                                'losses': 0,
                            },
                        ]
                    },
                    'elo_diff': 0.0,
                    'swiss_diff': 0.0,
                    'is_recommended': True,
                    'player_behind_schedule_count': 0,
                },
            ]
        }
