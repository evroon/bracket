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

    def get_log_level(self) -> int:
        return {
            Environment.CI: logging.WARNING,
            Environment.DEVELOPMENT: logging.DEBUG,
            Environment.PRODUCTION: logging.INFO,
            Environment.DEMO: logging.INFO,
        }[self]


class Config(BaseSettings):
    admin_email: str | None = None
    admin_password: str | None = None
    allow_insecure_http_sso: bool = False
    allow_user_registration: bool = True
    base_url: str = 'http://localhost:8400'
    cors_origin_regex: str = ''
    cors_origins: str = '*'
    jwt_secret: str
    pg_dsn: PostgresDsn = 'postgresql://user:pass@localhost:5432/db'  # type: ignore[assignment]
    sentry_dsn: str | None = None


class CIConfig(Config):
    class Config:
        env_file = 'ci.env'


class DevelopmentConfig(Config):
    admin_email = 'test@example.org'
    admin_password = 'aeGhoe1ahng2Aezai0Dei6Aih6dieHoo'
    allow_insecure_http_sso = True
    jwt_secret = '7495204c062787f257b12d03b88d80da1d338796a6449666eb634c9efbbf5fa7'

    class Config:
        env_file = 'dev.env'


class ProductionConfig(Config):
    class Config:
        env_file = 'prod.env'


class DemoConfig(Config):
    class Config:
        env_file = 'demo.env'


environment = Environment(os.getenv('ENVIRONMENT', 'CI').upper())
config: Config

match environment:
    case Environment.CI:
        config = CIConfig()  # type: ignore[call-arg]
    case Environment.DEVELOPMENT:
        config = DevelopmentConfig()  # type: ignore[call-arg]
    case Environment.PRODUCTION:
        config = ProductionConfig()  # type: ignore[call-arg]
    case Environment.DEMO:
        config = DemoConfig()  # type: ignore[call-arg]


def init_sentry() -> None:
    if config.sentry_dsn:
        sentry_sdk.init(
            dsn=config.sentry_dsn,
            environment=str(environment.value),
            include_local_variables=False,
        )
