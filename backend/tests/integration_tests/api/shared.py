import asyncio
import socket
from collections.abc import AsyncIterator, Sequence
from contextlib import closing
from typing import Final

import aiohttp
import uvicorn
from fastapi import FastAPI

from bracket.app import app
from bracket.routes.models import SuccessResponse
from bracket.utils.http import HTTPMethod
from bracket.utils.types import JsonDict
from tests.integration_tests.models import AuthContext

SUCCESS_RESPONSE = SuccessResponse().model_dump()


def find_free_port() -> int:
    """
    Ask the OS for an available port on localhost and then immediately give
    it back so it can be used in our test. This way we don't have to hard code
    a port to something and accidentally collide.
    """
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(("", 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        port: int = s.getsockname()[1]
        return port


TEST_HOST: Final[str] = "127.0.0.1"
TEST_PORT: Final[int] = find_free_port()


def get_root_uvicorn_url() -> str:
    return f"http://{TEST_HOST}:{TEST_PORT}/"


class UvicornTestServer(uvicorn.Server):
    """
    Uvicorn test server. Used as a test fixture to do
    integration tests against our FastAPI app.
    """

    def __init__(self, _app: FastAPI = app, host: str = TEST_HOST, port: int = TEST_PORT):
        self._startup_done = asyncio.Event()
        self._serve_task: asyncio.Task[None] | None = None
        self.should_exit: bool = False
        super().__init__(config=uvicorn.Config(_app, host=host, port=port))

    async def startup(self, sockets: Sequence[socket.socket] | None = None) -> None:
        sockets_list = list(sockets) if sockets is not None else sockets
        await super().startup(sockets=sockets_list)
        self.config.setup_event_loop()
        self._startup_done.set()

    async def up(self) -> None:
        self._serve_task = asyncio.create_task(self.serve())
        # If the startup takes longer than 5 seconds something is wrong and we can terminate it
        await asyncio.wait_for(self._startup_done.wait(), 5)

    async def down(self) -> None:
        self.should_exit = True
        assert self._serve_task is not None
        await self._serve_task


async def send_request(
    method: HTTPMethod,
    endpoint: str,
    body: JsonDict | AsyncIterator[bytes] | aiohttp.FormData | None = None,
    json: JsonDict | None = None,
    headers: JsonDict = {},
) -> JsonDict:
    async with aiohttp.ClientSession() as session:
        async with session.request(
            method=method.value,
            url=get_root_uvicorn_url() + endpoint,
            data=body,
            json=json,
            headers=headers,
        ) as resp:
            response: JsonDict = await resp.json()
            return response


async def send_request_raw(method: HTTPMethod, endpoint: str) -> str:
    async with aiohttp.ClientSession() as session:
        async with session.request(
            method=method.value,
            url=get_root_uvicorn_url() + endpoint,
        ) as resp:
            return await resp.text()


async def send_auth_request(
    method: HTTPMethod,
    endpoint: str,
    auth_context: AuthContext,
    body: JsonDict | None = None,
    json: JsonDict | None = None,
) -> JsonDict:
    return await send_request(
        method=method, endpoint=endpoint, body=body, json=json, headers=auth_context.headers
    )


async def send_tournament_request(
    method: HTTPMethod,
    endpoint: str,
    auth_context: AuthContext,
    body: JsonDict | AsyncIterator[bytes] | aiohttp.FormData | None = None,
    json: JsonDict | None = None,
) -> JsonDict:
    return await send_request(
        method=method,
        endpoint=f"tournaments/{auth_context.tournament.id}/{endpoint}",
        body=body,
        json=json,
        headers=auth_context.headers,
    )
