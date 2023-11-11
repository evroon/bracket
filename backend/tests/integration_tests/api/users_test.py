from bracket.database import database
from bracket.models.db.user import User
from bracket.schema import users
from bracket.sql.users import delete_user
from bracket.utils.db import fetch_one_parsed_certain
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_auth_request, send_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import assert_row_count_and_clear


async def test_users_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    assert await send_auth_request(
        HTTPMethod.GET, f'users/{auth_context.user.id}', auth_context, {}
    ) == {
        'data': {
            'email': auth_context.user.email,
            'created': '2200-01-01T00:00:00+00:00',
            'id': auth_context.user.id,
            'name': 'Donald Duck',
        },
    }


async def test_create_user(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name', 'email': 'some_email@email.com', 'password': 'my test pass'}
    response = await send_request(HTTPMethod.POST, 'users/register', None, body)
    assert response['data']['token_type'] == 'bearer'
    assert response['data']['user_id']
    await delete_user(response['data']['user_id'])


async def test_update_user(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    body = {'name': 'Some new name', 'email': 'some_email@email.com'}
    response = await send_auth_request(
        HTTPMethod.PUT, f'users/{auth_context.user.id}', auth_context, None, body
    )
    updated_user = await fetch_one_parsed_certain(
        database, User, query=users.select().where(users.c.id == auth_context.user.id)
    )
    assert updated_user.name == body['name']
    assert response['data']['name'] == body['name']

    await assert_row_count_and_clear(users, 1)
