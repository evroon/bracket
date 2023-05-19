import logging
import os
from enum import auto

import sentry_sdk
from pydantic import BaseSettings, Field, PostgresDsn

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
    cors_origins: str = Field(default='')
    cors_origin_regex: str = Field(default='')
    admin_email: str | None = Field(default=None)
    admin_password: str | None = Field(default=None)
    sentry_dsn: str | None = Field(default=None)
    allow_insecure_http_sso: bool = Field(default=False)
    base_url: str = Field(default='http://localhost:8400')
    allow_user_registration: bool = Field(default=True)


class CIConfig(Config):
    class Config:
        env_file = 'ci.env'


class DevelopmentConfig(Config):
    allow_insecure_http_sso: bool = Field(default=True)

    class Config:
        env_file = 'dev.env'


class ProductionConfig(Config):
    class Config:
        env_file = 'prod.env'


class DemoConfig(Config):
    class Config:
        env_file = 'demo.env'


environment = Environment(os.getenv('ENVIRONMENT', 'CI'))
config: Config

match environment:
    case Environment.CI:
        config = CIConfig()  # type: ignore[call-arg]
    case Environment.DEVELOPMENT:
        config = DevelopmentConfig()  # type: ignore[call-arg]


def init_sentry() -> None:
    if config.sentry_dsn:
        sentry_sdk.init(
            dsn=config.sentry_dsn,
            environment=str(environment.value),
            include_local_variables=False,
        )
