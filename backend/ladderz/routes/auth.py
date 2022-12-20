from typing import Any

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from heliclockter import datetime_utc, timedelta
from jwt import DecodeError, ExpiredSignatureError
from passlib.context import CryptContext
from pydantic import BaseModel

from ladderz.config import config
from ladderz.database import database
from ladderz.models.db.user import User, UserInDB, UserPublic
from ladderz.schema import users
from ladderz.utils.db import fetch_one_parsed
from ladderz.utils.types import JsonDict, JsonList, assert_some

router = APIRouter()

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 7 * 24 * 60  # 1 week

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


async def get_user(email: str) -> UserInDB | None:
    return await fetch_one_parsed(database, UserInDB, users.select().where(users.c.email == email))


async def authenticate_user(email: str, password: str) -> UserInDB | None:
    user = await get_user(email)

    if not user or not verify_password(password, user.password_hash):
        return None

    return user


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime_utc.now() + expires_delta
    else:
        expire = datetime_utc.now() + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.jwt_secret, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, config.jwt_secret, algorithms=[ALGORITHM])
        email: str = str(payload.get("user"))
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except (DecodeError, ExpiredSignatureError):
        raise credentials_exception

    user = await get_user(email=assert_some(token_data.email))
    if user is None:
        raise credentials_exception

    return UserPublic.parse_obj(user.dict())


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> JsonDict:
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"user": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me/", response_model=UserPublic)
async def read_users_me(current_user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return current_user
