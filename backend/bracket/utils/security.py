import aiohttp
import bcrypt

from bracket.config import config


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


async def verify_captcha_token(captcha_token: str) -> bool:
    if config.captcha_secret is None:
        return True

    payload = {"response": captcha_token, "secret": config.captcha_secret}

    async with aiohttp.ClientSession() as session:
        async with session.post("https://api.hcaptcha.com/siteverify", data=payload) as resp:
            response_json = await resp.json()
            return bool(response_json["success"])
