from typing import Literal
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import NotFoundException
from models import *
from pydantic import BaseModel


class ListAccessSpec(BaseModel):
    data: GroceryList
    favorited: bool
    access_type: Literal["id", "alias"]
    access_reference: str


class UserController(Controller):
    path = "/user"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @get("/")
    async def get_self(self, user: User) -> RedactedUser:
        return user.redacted

    @get("/lists")
    async def get_user_lists(self, user: User) -> list[ListAccessSpec]:
        results: list[ListAccessSpec] = []
        results.extend([ListAccessSpec(
            data=i, access_type="id", access_reference=i.id_hex, favorited=False) for i in await GroceryList.find(GroceryList.owner_id == user.id_hex).to_list()])

        return results
