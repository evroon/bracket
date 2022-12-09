from contextlib import contextmanager
from typing import Generator
from unittest.mock import Mock, patch

import jwt

from ladderz.config import config
from ladderz.utils.http import HTTPMethod
from ladderz.utils.types import JsonDict
from tests.integration_tests.api.shared import send_request
from tests.integration_tests.mocks import MOCK_NOW, MOCK_USER
from tests.integration_tests.sql import inserted_user


@contextmanager
def mock_auth_time() -> Generator[None, None, None]:
    with patch('ladderz.routes.auth.datetime_utc.now', Mock(return_value=MOCK_NOW)):
        yield


async def test_get_token_success(startup_and_shutdown_uvicorn_server: None) -> None:
    body = {
        'username': MOCK_USER.username,
        'password': 'mypassword',
    }
    with mock_auth_time():
        async with inserted_user(MOCK_USER):
            response = JsonDict(await send_request(HTTPMethod.POST, 'token', body))

    assert 'access_token' in response
    assert response.get('token_type') == 'bearer'

    decoded = jwt.decode(response['access_token'], config.jwt_secret, algorithms=['HS256'])
    assert decoded == {'user': MOCK_USER.username, 'exp': 7258120200}


async def test_get_token_invalid_credentials(startup_and_shutdown_uvicorn_server: None) -> None:
    body = {
        'username': MOCK_USER.username,
        'password': 'invalid password',
    }
    with mock_auth_time():
        async with inserted_user(MOCK_USER):
            response = JsonDict(await send_request(HTTPMethod.POST, 'token', body))

    assert response == {'detail': 'Incorrect username or password'}


async def test_auth_on_protected_endpoint(startup_and_shutdown_uvicorn_server: None) -> None:
    token = (
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJ1c2VyIjoiZG9uYWxkX2R1Y2siLCJleHAiOjcyNTgxMjAyMDB9.'
        + 'CRk4n5gmgto5K-qWtI4hbcqo92BxLkggwwK1yTgWGLM'
    )
    headers = {'Authorization': f'Bearer {token}'}

    async with inserted_user(MOCK_USER) as user_inserted:
        response = JsonDict(await send_request(HTTPMethod.GET, 'users/me', {}, headers))

        assert response == {
            'id': user_inserted.id,
            'username': user_inserted.username,
            'name': user_inserted.name,
            'created': '2200-01-01T00:00:00+00:00',
        }


async def test_invalid_token(startup_and_shutdown_uvicorn_server: None) -> None:
    headers = {'Authorization': 'Bearer some.invalid.token'}

    response = JsonDict(await send_request(HTTPMethod.GET, 'users/me', {}, headers))
    assert response == {'detail': 'Could not validate credentials'}
