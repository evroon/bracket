from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

from bracket.config import config
from bracket.models.metrics import get_request_metrics

router = APIRouter(prefix=config.api_prefix)


@router.get("/metrics", response_class=PlainTextResponse)
async def get_metrics() -> PlainTextResponse:
    return PlainTextResponse(get_request_metrics().to_prometheus())


@router.get("/ping", summary="Healthcheck ping")
async def ping() -> str:
    return "ping"
