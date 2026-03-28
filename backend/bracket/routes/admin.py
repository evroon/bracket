from fastapi import APIRouter

from bracket.config import config

router = APIRouter(
    prefix=config.api_prefix,
)
