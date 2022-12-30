from bracket.utils.dummy_records import DUMMY_ROUND1
from bracket.utils.http import HTTPMethod
from tests.integration_tests.api.shared import send_tournament_request
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_round


async def test_upcoming_matches_endpoint(
    startup_and_shutdown_uvicorn_server: None, auth_context: AuthContext
) -> None:
    async with inserted_round(
        DUMMY_ROUND1.copy(update={'tournament_id': auth_context.tournament.id, 'is_draft': True})
    ):
        json_response = await send_tournament_request(
            HTTPMethod.GET, 'upcoming_matches', auth_context, {}
        )
        assert json_response == {'data': []}
