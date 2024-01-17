import aiohttp
from passlib.context import CryptContext

from bracket.config import config

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def verify_captcha_token(captcha_token: str) -> bool:
    if config.captcha_secret is None:
        return True

    payload = {'response': captcha_token, 'secret': config.captcha_secret}

    async with aiohttp.ClientSession() as session:
        async with session.post('https://api.hcaptcha.com/siteverify', data=payload) as resp:
            response_json = await resp.json()
            return bool(response_json['success'])
