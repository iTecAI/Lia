from typing import Literal
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import NotFoundException
from models import *
from pydantic import BaseModel


class ListAccessSpec(BaseModel):
    data: GroceryList
    access_type: Literal["id", "alias"]
    access_reference: str


class UserController(Controller):
    path = "/user"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redacted
