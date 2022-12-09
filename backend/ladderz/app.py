from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from ladderz.database import database
from ladderz.routes import auth

app = FastAPI(
    title="Ladderz API",
    docs_url="/docs",
    version="1.0.0",
)

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await database.connect()


@app.on_event("shutdown")
async def shutdown() -> None:
    await database.disconnect()


@app.get('/ping', summary="Healthcheck ping")
async def ping() -> str:
    return 'ping'


app.include_router(auth.router, tags=['auth'])
