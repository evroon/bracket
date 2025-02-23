from __future__ import annotations

from enum import StrEnum, auto
from typing import NewType

from pydantic import BaseModel

SSOID = NewType("SSOID", int)


class SSOConfig(BaseModel):
    id: SSOID
    provider: SSOProvider
    client_id: str
    client_secret: str
    redirect_uri: str
    allow_insecure_http: bool
    openid_discovery_url: str | None = None
    openid_scopes: str | None = None


class SSOProvider(StrEnum):
    google = auto()
    github = auto()
    openid = auto()
