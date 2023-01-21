import logging
import os
from enum import auto

import sentry_sdk
from pydantic import BaseSettings, PostgresDsn

from bracket.utils.types import EnumAutoStr


class Environment(EnumAutoStr):
    PRODUCTION = auto()
    DEVELOPMENT = auto()
    DEMO = auto()
    CI = auto()

    def get_env_filepath(self) -> str:
        return {
            Environment.PRODUCTION: 'prod.env',
            Environment.DEVELOPMENT: 'dev.env',
            Environment.CI: 'ci.env',
            Environment.DEMO: 'demo.env',
        }[self]

    def get_log_level(self) -> int:
        return {
            Environment.CI: logging.WARNING,
            Environment.DEVELOPMENT: logging.DEBUG,
            Environment.PRODUCTION: logging.INFO,
            Environment.DEMO: logging.INFO,
        }[self]


class Config(BaseSettings):
    pg_dsn: PostgresDsn = 'postgresql://user:pass@localhost:5432/db'  # type: ignore[assignment]
    jwt_secret: str
    cors_origins: str = ''
    cors_origin_regex: str = ''
    admin_email: str | None = None
    admin_password: str | None = None
    sentry_dsn: str | None = None


environment = Environment(os.getenv('ENVIRONMENT', 'DEVELOPMENT'))
config = Config(_env_file=environment.get_env_filepath())


def init_sentry() -> None:
    if config.sentry_dsn:
        sentry_sdk.init(
            dsn=config.sentry_dsn,
            environment=str(environment.value),
            with_locals=False,
        )
