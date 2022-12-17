import asyncio
import os
from asyncio import AbstractEventLoop
from functools import partial
from typing import AsyncIterator, Iterator

import aioresponses
import pytest
from aiohttp import ClientResponse
from databases import Database

from ladderz.database import database, engine
from ladderz.schema import metadata
from tests.integration_tests.api.shared import UvicornTestServer

os.environ['ENVIRONMENT'] = 'CI'


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


@pytest.fixture
def mock_http() -> Iterator[aioresponses.aioresponses]:
    with aioresponses.aioresponses() as m:
        m.add = partial(m.add, response_class=ClientResponse)  # type: ignore[assignment]
        yield m


@pytest.fixture(scope="session")
def event_loop() -> AsyncIterator[AbstractEventLoop]:  # type: ignore[misc]
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()

    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def reinit_database(
    event_loop: AbstractEventLoop,  # pylint: disable=redefined-outer-name
) -> AsyncIterator[Database]:
    await database.connect()
    metadata.drop_all(engine)
    metadata.create_all(engine)
    yield database
