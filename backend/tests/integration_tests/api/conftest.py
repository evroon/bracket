# pylint: disable=redefined-outer-name
from collections.abc import AsyncIterator

import pytest_asyncio

from tests.integration_tests.api.shared import UvicornTestServer


@pytest_asyncio.fixture(loop_scope="session", scope="module", autouse=True)
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
