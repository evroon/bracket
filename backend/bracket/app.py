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
from bracket.database import database
from bracket.models.metrics import RequestDefinition, get_request_metrics
from bracket.routes import (
    auth,
    clubs,
    courts,
    matches,
    metrics,
    players,
    rounds,
    stage_items,
    stages,
    teams,
    tournaments,
    users,
)
from bracket.utils.db_init import init_db_when_empty

init_sentry()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    await database.connect()
    await init_db_when_empty()

    yield

    if environment != Environment.CI:
        await database.disconnect()


app = FastAPI(
    title="Bracket API",
    docs_url="/docs",
    version="1.0.0",
    lifespan=lifespan,
)

origins = ["http://localhost", "http://localhost:3000", *config.cors_origins.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


@app.get('/ping', summary="Healthcheck ping")
async def ping() -> str:
    return 'ping'


@app.exception_handler(HTTPException)
async def validation_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({'detail': exc.detail}, status_code=exc.status_code)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse({'detail': 'Internal server error'}, status_code=500)


app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(metrics.router, tags=['metrics'])
app.include_router(auth.router, tags=['auth'])
app.include_router(clubs.router, tags=['clubs'])
app.include_router(courts.router, tags=['courts'])
app.include_router(matches.router, tags=['matches'])
app.include_router(players.router, tags=['players'])
app.include_router(rounds.router, tags=['rounds'])
app.include_router(stage_items.router, tags=['stage_items'])
app.include_router(stages.router, tags=['stages'])
app.include_router(teams.router, tags=['teams'])
app.include_router(tournaments.router, tags=['tournaments'])
app.include_router(users.router, tags=['users'])
