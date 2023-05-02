# pylint: disable=redefined-outer-name
import asyncio
from asyncio import AbstractEventLoop
from typing import AsyncIterator

import pytest
from databases import Database

from bracket.database import database, engine
from bracket.schema import metadata
from tests.integration_tests.api.shared import UvicornTestServer
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_auth_context


@pytest.fixture(scope='module')
async def startup_and_shutdown_uvicorn_server() -> AsyncIterator[None]:
    """
    Start server as test fixture and tear down after test
    """
    server = UvicornTestServer()
    try:
        await server.up()
        yield
    finally:
        await server.down()


@pytest.fixture(scope="session")
def event_loop() -> AsyncIterator[AbstractEventLoop]:  # type: ignore[misc]
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()

    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def reinit_database(event_loop: AbstractEventLoop) -> AsyncIterator[Database]:
    await database.connect()
    metadata.drop_all(engine)
    metadata.create_all(engine)
    try:
        yield database
    finally:
        await database.disconnect()


@pytest.fixture(scope="session")
async def auth_context(reinit_database: Database) -> AsyncIterator[AuthContext]:
    async with reinit_database:
        async with inserted_auth_context() as auth_context:
            yield auth_context
