from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import pytest
from heliclockter import datetime_utc

from bracket.database import database
from bracket.models.db.account import UserAccountType
from bracket.models.db.user import User, UserInsertable
from bracket.schema import users
from bracket.sql.users import create_user, delete_user, get_user_by_id
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.http import HTTPMethod
from bracket.utils.security import hash_password
from bracket.utils.types import assert_some
from tests.integration_tests.api.shared import send_auth_request, send_request
from tests.integration_tests.mocks import get_mock_token
from tests.integration_tests.models import AuthContext


@pytest.mark.asyncio(loop_scope="session")
async def test_users_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    expected_data = {
        "data": {
            "email": auth_context.user.email,
            "created": "2000-01-01T00:00:00Z",
            "id": auth_context.user.id,
            "name": "Donald Duck",
            "account_type": UserAccountType.REGULAR.value,
        },
    }

    assert (
        await send_auth_request(HTTPMethod.GET, f"users/{auth_context.user.id}", auth_context, {})
        == expected_data
    )

    assert await send_auth_request(HTTPMethod.GET, "users/me", auth_context, {}) == expected_data


@pytest.mark.asyncio(loop_scope="session")
async def test_create_user(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {
        "name": "Some new name",
        "email": "some_email@email.com",
        "password": "my test pass",
        "captcha_token": "my token",
    }
    response = await send_request(HTTPMethod.POST, "users/register", None, body)
    assert "data" in response, response
    assert response["data"]["token_type"] == "bearer"
    assert response["data"]["user_id"]
    await delete_user(response["data"]["user_id"])


@pytest.mark.asyncio(loop_scope="session")
async def test_create_demo_user(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {"captcha_token": "my token"}
    response = await send_request(HTTPMethod.POST, "users/register_demo", None, body)
    assert "data" in response, response
    assert response["data"]["token_type"] == "bearer"
    assert response["data"]["user_id"]
    await delete_user(response["data"]["user_id"])


@asynccontextmanager
async def temporary_user() -> AsyncIterator[tuple[User, dict[str, str]]]:
    user_created = None
    try:
        new_user = UserInsertable(
            email="email123@example.org",
            password_hash=hash_password("some password"),
            name="name",
            created=datetime_utc.now(),
            account_type=UserAccountType.REGULAR,
        )
        user_created = await create_user(new_user)
        headers = {"Authorization": f"Bearer {get_mock_token(user_created)}"}
        yield user_created, headers
    finally:
        if user_created is not None:
            await delete_user(user_created.id)


@pytest.mark.asyncio(loop_scope="session")
async def test_update_user(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with temporary_user() as (user_created, headers):
        body = {"name": "Some new name", "email": "some_email@email.com"}
        response = await send_auth_request(
            HTTPMethod.PUT,
            f"users/{user_created.id}",
            auth_context.model_copy(update={"user": user_created, "headers": headers}),
            json=body,
        )
        updated_user = assert_some(await get_user_by_id(user_created.id))
        assert response["data"]["name"] == body["name"]
        assert updated_user.name == body["name"]


@pytest.mark.asyncio(loop_scope="session")
async def test_update_user_password(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with temporary_user() as (user_created, headers):
        body = {"password": "somepassword"}
        response = await send_auth_request(
            HTTPMethod.PUT,
            f"users/{user_created.id}/password",
            auth_context.model_copy(update={"user": user_created, "headers": headers}),
            json=body,
        )
        updated_user = await fetch_one_parsed_certain(
            database, User, query=users.select().where(users.c.id == user_created.id)
        )

        assert response.get("success") is True, response
        assert updated_user.password_hash and len(updated_user.password_hash) == 60
        assert auth_context.user != updated_user.password_hash
