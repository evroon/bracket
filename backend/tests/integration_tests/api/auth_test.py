from collections.abc import Generator
from contextlib import contextmanager
from unittest.mock import Mock, patch

import jwt

from bracket.config import config
from bracket.models.db.account import UserAccountType
from bracket.utils.dummy_records import DUMMY_CLUB, DUMMY_TOURNAMENT
from bracket.utils.http import HTTPMethod
from bracket.utils.types import JsonDict
from tests.integration_tests.api.shared import send_auth_request, send_request
from tests.integration_tests.mocks import MOCK_NOW, get_mock_token, get_mock_user
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_club, inserted_tournament, inserted_user


@contextmanager
def mock_auth_time() -> Generator[None, None, None]:
    with patch("bracket.routes.auth.datetime_utc.now", Mock(return_value=MOCK_NOW)):
        yield


async def test_get_token_success(startup_and_shutdown_uvicorn_server: None) -> None:
    mock_user = get_mock_user()
    body = {
        "username": mock_user.email,
        "password": "mypassword",
    }
    with mock_auth_time():
        async with inserted_user(mock_user):
            response = JsonDict(await send_request(HTTPMethod.POST, "token", body))

    assert "access_token" in response
    assert response.get("token_type") == "bearer"

    decoded = jwt.decode(response["access_token"], config.jwt_secret, algorithms=["HS256"])
    assert decoded == {"user": mock_user.email, "exp": 7258723200}


async def test_get_token_invalid_credentials(startup_and_shutdown_uvicorn_server: None) -> None:
    mock_user = get_mock_user()
    body = {
        "username": mock_user,
        "password": "invalid password",
    }
    with mock_auth_time():
        async with inserted_user(mock_user):
            response = JsonDict(await send_request(HTTPMethod.POST, "token", body))

    assert response == {"detail": "Incorrect email or password"}


async def test_auth_on_protected_endpoint(startup_and_shutdown_uvicorn_server: None) -> None:
    mock_user = get_mock_user()
    headers = {"Authorization": f"Bearer {get_mock_token(mock_user)}"}

    async with inserted_user(mock_user) as user_inserted:
        response = JsonDict(
            await send_request(HTTPMethod.GET, f"users/{user_inserted.id}", {}, None, headers)
        )

        assert response == {
            "data": {
                "id": user_inserted.id,
                "email": user_inserted.email,
                "name": user_inserted.name,
                "created": "2000-01-01T00:00:00Z",
                "account_type": UserAccountType.REGULAR.value,
            }
        }


async def test_invalid_token(startup_and_shutdown_uvicorn_server: None) -> None:
    headers = {"Authorization": "Bearer some.invalid.token"}

    response = JsonDict(await send_request(HTTPMethod.GET, "users/me", {}, None, headers))
    assert response == {"detail": "Could not validate credentials"}


async def test_not_authenticated_for_tournament(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_club(DUMMY_CLUB) as club_inserted:
        async with inserted_tournament(
            DUMMY_TOURNAMENT.model_copy(
                update={"club_id": club_inserted.id, "dashboard_endpoint": "some-slug"}
            )
        ) as tournament_inserted:
            response = JsonDict(
                await send_auth_request(
                    HTTPMethod.GET, f"tournaments/{tournament_inserted.id}/players", auth_context
                )
            )
    assert response == {"detail": "Could not validate credentials"}
