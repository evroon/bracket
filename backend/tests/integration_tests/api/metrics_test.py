from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_request_raw


async def test_metrics_endpoint(startup_and_shutdown_uvicorn_server: None) -> None:
    text_response = await send_request_raw(HTTPMethod.GET, "metrics")
    assert "HELP bracket_response_time" in text_response
