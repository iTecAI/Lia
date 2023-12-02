from beanie import Document
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import Field, BaseModel
from typing import Union
from hashlib import pbkdf2_hmac
import os


class Session(Document):
    id: UUID = Field(default_factory=uuid4)
    last_request: datetime
    user_id: Union[str, None]

    class Settings:
        name = "sessions"

    async def get_user(self) -> Union["User", None]:
        if not self.user_id:
            return None

        return await User.get(self.user_id)


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


class User(Document):
    id: UUID = Field(default_factory=uuid4)
    username: str
    password: Password

    class Settings:
        name = "users"

    async def get_sessions(self) -> list[Session]:
        return await Session.find(Session.user_id == self.id).to_list()

    @classmethod
    def create(cls, username: str, password: str) -> "User":
        return User(
            username=username,
            password=Password.create(password)
        )
