from functools import cache
from typing import Any

import aiohttp
from fastapi_sso import GithubSSO, GoogleSSO, OpenID, SSOBase, create_provider
from fastapi_sso.sso.base import DiscoveryDocument
from httpx import AsyncClient

from bracket.config import config
from bracket.models.sso import SSOID, SSOConfig, SSOProvider


async def get_discovery_document(discovery_url: str) -> DiscoveryDocument:
    async with aiohttp.ClientSession() as session:
        response = await session.get(discovery_url)
        response.raise_for_status()
        response_json = await response.json()
        return {
            "authorization_endpoint": response_json["authorization_endpoint"],
            "token_endpoint": response_json["token_endpoint"],
            "userinfo_endpoint": response_json["userinfo_endpoint"],
        }


async def build_openid_sso(sso_config: SSOConfig) -> SSOBase:
    assert sso_config.openid_discovery_url is not None, (
        "`openid_discovery_url` should be set for OpenID SSO"
    )
    assert sso_config.openid_scopes is not None, "`openid_scopes` should be set for OpenID SSO"

    def convert_openid(response: dict[str, Any], _client: AsyncClient | None) -> OpenID:
        return OpenID(display_name=response["sub"])

    GenericSSO = create_provider(
        name="oidc",
        discovery_document=await get_discovery_document(sso_config.openid_discovery_url),
        response_convertor=convert_openid,
    )

    return GenericSSO(
        client_id=sso_config.client_id,
        client_secret=sso_config.client_secret,
        redirect_uri=sso_config.redirect_uri,
        allow_insecure_http=sso_config.allow_insecure_http,
        scope=sso_config.openid_scopes.split(","),
    )


async def build_sso(sso_config: SSOConfig) -> SSOBase:
    match sso_config.provider:
        case SSOProvider.google:
            return GoogleSSO(
                client_id=sso_config.client_id,
                client_secret=sso_config.client_secret,
                redirect_uri=sso_config.redirect_uri,
                allow_insecure_http=sso_config.allow_insecure_http,
            )
        case SSOProvider.github:
            return GithubSSO(
                client_id=sso_config.client_id,
                client_secret=sso_config.client_secret,
                redirect_uri=sso_config.redirect_uri,
                allow_insecure_http=sso_config.allow_insecure_http,
            )
        case SSOProvider.openid:
            return await build_openid_sso(sso_config)


@cache
async def get_sso_providers() -> dict[SSOID, SSOBase]:
    configs = []
    if (
        config.sso_1_provider is not None
        and config.sso_1_client_id is not None
        and config.sso_1_client_secret is not None
    ):
        configs.append(
            SSOConfig(
                id=SSOID(1),
                provider=config.sso_1_provider,
                client_id=config.sso_1_client_id,
                client_secret=config.sso_1_client_secret,
                redirect_uri=f"{config.base_url}/sso-callback",
                allow_insecure_http=config.sso_1_allow_insecure_http_sso,
            )
        )

    return {sso_config.id: await build_sso(sso_config) for sso_config in configs}
