from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Union
from hashlib import pbkdf2_hmac
import os

from .extra import Favorite
from .base import BaseDocument
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.exceptions import *


class Session(BaseDocument):
    last_request: datetime
    user_id: Union[str, None]

    class Settings:
        name = "sessions"

    async def get_user(self) -> Union["User", None]:
        if not self.user_id:
            return None

        return await User.get(self.user_id)

    @classmethod
    async def from_connection(cls, connection: ASGIConnection) -> Union["Session", None]:
        token = connection.cookies.get("lia-token")
        if token:
            return await Session.get(token)
        return None


class Password(BaseModel):
    hashed: str
    salt: str

    @classmethod
    def create(cls, password: str) -> "Password":
        if len(password) > 512:
            raise RuntimeError(
                "Password length too large (max is 512 characters)")
        salt = os.urandom(32)
        key = pbkdf2_hmac("sha256", password.encode(), salt, 500000)
        return Password(hashed=key.hex(), salt=salt.hex())

    def verify(self, password: str) -> bool:
        if len(password) > 512:
            return False

        attempt = pbkdf2_hmac("sha256", password.encode(),
                              bytes.fromhex(self.salt), 500000).hex()
        return self.hashed == attempt


class RedactedUser(BaseModel):
    id: str
    username: str
    admin: bool


class User(BaseDocument):
    username: str
    password: Password
    admin: bool

    class Settings:
        name = "users"

    async def get_sessions(self) -> list[Session]:
        return await Session.find(Session.user_id == self.id_hex).to_list()
    
    async def get_favorites(self) -> list[Favorite]:
        return await Favorite.find(Favorite.user_id == self.id_hex).to_list()

    @classmethod
    def create(cls, username: str, password: str, admin=False) -> "User":
        return User(
            username=username,
            password=Password.create(password),
            admin=admin
        )

    @property
    def redacted(self) -> RedactedUser:
        return RedactedUser(id=self.id_hex, username=self.username, admin=self.admin)


async def depends_user(session: Session) -> Union[User, None]:
    if session:
        return await session.get_user()
    return None


async def guard_session_inner(connection: ASGIConnection, handler: BaseRouteHandler) -> Session:
    session = await Session.from_connection(connection)
    if not session:
        raise NotAuthorizedException(
            detail="Valid authentication not provided.")

    context = connection.app.state["context"]
    if session.last_request + timedelta(seconds=context.options.session_expire) < datetime.now():
        await session.delete()
        raise NotAuthorizedException(
            detail="Current token is expired, please create a new one.")

    return session


async def guard_session(connection: ASGIConnection, handler: BaseRouteHandler) -> None:
    await guard_session_inner(connection, handler)


async def guard_logged_in(connection: ASGIConnection, handler: BaseRouteHandler) -> None:
    session = await guard_session_inner(connection, handler)

    if not await session.get_user():
        session.user_id = None
        await session.save()
        raise NotAuthorizedException(
            detail="Requested endpoint is only accessible to logged-in users.")
