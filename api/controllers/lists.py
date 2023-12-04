from typing import Literal
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import NotFoundException
from models import *
from pydantic import BaseModel


class ListCreationModel(BaseModel):
    name: str
    stores: list[str]
    type: Literal["list", "recipe"]


class ListController(Controller):
    path = "/grocery/lists"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @post("/create")
    async def create_list(self, user: User, data: ListCreationModel) -> GroceryList:
        new_list = GroceryList(
            name=data.name,
            owner_id=user.id_hex,
            included_stores=data.stores,
            type=data.type
        )
        await new_list.save()
        return new_list

    @get("/id/{id:str}")
    async def get_list_by_id(self, user: User, id: str) -> GroceryList:
        result = await GroceryList.get(id)
        if not result or result.owner_id != user.id_hex:
            raise NotFoundException(
                detail=f"List with id {id} does not exist, or you cannot access it by ID")

        return result
