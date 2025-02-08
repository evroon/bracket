import pytest

from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_request


@pytest.mark.asyncio(loop_scope="session")
async def test_ping_endpoint(startup_and_shutdown_uvicorn_server: None) -> None:
    assert await send_request(HTTPMethod.GET, "ping") == "ping"
