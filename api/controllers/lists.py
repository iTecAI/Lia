from typing import Literal
from litestar import Controller, get, post
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.di import Provide
from litestar.exceptions import NotFoundException, ValidationException
from models import *
from pydantic import BaseModel


class ListCreationModel(BaseModel):
    name: str
    stores: list[str]
    type: Literal["grocery", "recipe"]


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
            type=data.type,
        )
        await new_list.save()
        return new_list


async def guard_list_access(
    connection: ASGIConnection, handler: BaseRouteHandler
) -> None:
    session = await guard_session_inner(connection, handler)
    if not session.user_id:
        raise RuntimeError
    method = connection.path_params.get("method", None)
    if not method:
        raise ValidationException()
    if method == "id":
        result = await GroceryList.get(connection.path_params.get("reference", "null"))
        if not result or result.owner_id != session.user_id:
            raise NotFoundException(
                detail=f"List with id {id} does not exist, or you cannot access it by ID"
            )
    if method == "alias":
        pass
    raise ValidationException()


async def depends_list(method: str, reference: str) -> GroceryList:
    if method == "id":
        return await GroceryList.get(reference)
    else:
        # TODO: Update for alias support
        return await GroceryList.get(reference)


class ListsController(Controller):
    path = "/grocery/lists/{method:str}/{reference:str}"
    guards = [guard_logged_in, guard_list_access]
    dependencies = {
        "user": Provide(depends_user),
        "list_data": Provide(depends_list),
    }

    @get("/")
    async def get_list_by_id(self, user: User, list_data: GroceryList) -> GroceryList:
        return list_data
