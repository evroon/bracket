import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from starlette.exceptions import HTTPException
from starlette.middleware.base import RequestResponseEndpoint
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse, Response
from starlette.staticfiles import StaticFiles

from bracket.config import Environment, config, environment, init_sentry
from bracket.cronjobs.scheduling import start_cronjobs
from bracket.database import database
from bracket.models.metrics import RequestDefinition, get_request_metrics
from bracket.routes import (
    auth,
    clubs,
    courts,
    internals,
    matches,
    players,
    rounds,
    stage_items,
    stages,
    teams,
    tournaments,
    users,
)
from bracket.utils.alembic import alembic_run_migrations
from bracket.utils.asyncio import AsyncioTasksManager
from bracket.utils.db_init import init_db_when_empty
from bracket.utils.logging import logger

init_sentry()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await database.connect()
    await init_db_when_empty()

    if config.auto_run_migrations and environment is not Environment.CI:
        alembic_run_migrations()

    if environment is Environment.PRODUCTION:
        start_cronjobs()

    if environment is Environment.PRODUCTION and config.cors_origins == "*":
        logger.warning("It's advised to set the `CORS_ORIGINS` environment variable in production")

    yield

    if environment is not Environment.CI:
        await database.disconnect()

    await AsyncioTasksManager.gather()


routers = {
    "Internals": internals.router,
    "Auth": auth.router,
    "Clubs": clubs.router,
    "Courts": courts.router,
    "Matches": matches.router,
    "Players": players.router,
    "Rounds": rounds.router,
    "Stage Items": stage_items.router,
    "Stages": stages.router,
    "Teams": teams.router,
    "Tournaments": tournaments.router,
    "Users": users.router,
}

table_of_contents = "\n\n".join(
    [f"- [{tag}](#tag/{tag.replace(' ', '-')})" for tag in routers.keys()]
)


description = f"""
### Description
This API allows you to do everything the frontend of [Bracket](https://github.com/evroon/bracket)
allows you to do (the frontend uses this API as well).

Fore more information, see the [documentation](https://docs.bracketapp.nl).

### Table of Contents
*(links only work for [ReDoc](https://api.bracketapp.nl/redoc), not for Swagger UI)*

{table_of_contents}

### Links
GitHub: <https://github.com/evroon/bracket>

Docs: <https://docs.bracketapp.nl>

Demo: <https://www.bracketapp.nl/demo>

API docs (Redoc): <https://api.bracketapp.nl/redoc>

API docs (Swagger UI): <https://api.bracketapp.nl/docs>
"""

app = FastAPI(
    title="Bracket API",
    docs_url="/docs",
    version="1.0.0",
    lifespan=lifespan,
    summary="API for Bracket, an open source tournament system.",
    description=description,
    license_info={
        "name": "AGPL-3.0",
        "url": "https://www.gnu.org/licenses/agpl-3.0.en.html",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_origin_regex=config.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next: RequestResponseEndpoint) -> Response:
    start_time = time.time()
    request_metrics = get_request_metrics()
    request_metrics.request_count[RequestDefinition.from_request(request)] += 1
    response = await call_next(request)
    process_time = time.time() - start_time
    request_metrics.response_time[RequestDefinition.from_request(request)] = process_time
    return response


@app.exception_handler(HTTPException)
async def validation_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse({"detail": "Internal server error"}, status_code=500)


app.mount("/static", StaticFiles(directory="static"), name="static")

for tag, router in routers.items():
    app.include_router(router, tags=[tag])
