from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

from bracket.config import Environment, config, environment, init_sentry
from bracket.database import database, init_db_when_empty
from bracket.routes import auth, clubs, matches, players, rounds, teams, tournaments, users

init_sentry()

app = FastAPI(
    title="Bracket API",
    docs_url="/docs",
    version="1.0.0",
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


@app.on_event("startup")
async def startup() -> None:
    await database.connect()
    await init_db_when_empty()


@app.on_event("shutdown")
async def shutdown() -> None:
    # On CI, we need first to clean up db data in conftest.py before we can disconnect the
    # db connections.
    if environment != Environment.CI:
        await database.disconnect()


@app.get('/ping', summary="Healthcheck ping")
async def ping() -> str:
    return 'ping'


app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router, tags=['auth'])
app.include_router(clubs.router, tags=['clubs'])
app.include_router(tournaments.router, tags=['tournaments'])
app.include_router(players.router, tags=['players'])
app.include_router(rounds.router, tags=['rounds'])
app.include_router(matches.router, tags=['matches'])
app.include_router(teams.router, tags=['teams'])
app.include_router(users.router, tags=['users'])
