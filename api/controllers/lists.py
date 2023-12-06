from typing import Any, Literal, Optional
from litestar import Controller, delete, get, post
from litestar.connection import ASGIConnection
from litestar.handlers.base import BaseRouteHandler
from litestar.di import Provide
from litestar.exceptions import NotFoundException, ValidationException
from models import *
from pydantic import BaseModel
from util import Events


class ListCreationModel(BaseModel):
    name: str
    stores: list[str]
    type: Literal["grocery", "recipe"]


class ListItemCreationModel(BaseModel):
    name: str
    quantity: QuantitySpec
    categories: list[str]
    price: float
    location: Optional[str]
    linked_item: Any


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
        raise ValidationException(detail="Missing method")
    if method == "id":
        result = await GroceryList.get(connection.path_params.get("reference", "null"))
        if not result or result.owner_id != session.user_id:
            raise NotFoundException(
                detail=f"List with id {id} does not exist, or you cannot access it by ID")
        return None
    if method == "alias":
        return None
    raise ValidationException(detail="Invalid method")


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
    async def get_list_by_id(self, list_data: GroceryList) -> GroceryList:
        return list_data

    @get("/items")
    async def get_items(self, list_data: GroceryList) -> list[GroceryListItem]:
        return await list_data.get_items()

    @post("/item")
    async def add_list_item(
        self,
        user: User,
        list_data: GroceryList,
        data: ListItemCreationModel,
        events: Events
    ) -> GroceryListItem:
        new_item = GroceryListItem(
            name=data.name,
            list_id=list_data.id_hex,
            added_by=user.id_hex,
            checked=False,
            quantity=data.quantity,
            alternative=None,
            categories=data.categories,
            price=data.price,
            location=data.location if data.location and len(
                data.location) > 0 else None,
            linked_item=data.linked_item,
            recipe=None)
        await new_item.save()
        await events.publish(f"list.{list_data.id_hex}", data={"action": "addItem"})
        return new_item

    @post("/item/{item:str}/checked", status_code=204)
    async def check_list_item(self, list_data: GroceryList, item: str, events: Events) -> None:
        item_result = await GroceryListItem.get(item)
        if not item_result:
            raise NotFoundException(detail="Item not found.")

        item_result.checked = True
        await item_result.save()
        await events.publish(f"list.{list_data.id_hex}", data={"action": "checkItem"})

    @delete("/item/{item:str}/checked", status_code=204)
    async def uncheck_list_item(self, list_data: GroceryList, item: str, events: Events) -> None:
        item_result = await GroceryListItem.get(item)
        if not item_result:
            raise NotFoundException(detail="Item not found.")

        item_result.checked = False
        await item_result.save()
        await events.publish(f"list.{list_data.id_hex}", data={"action": "uncheckItem"})

    @post("/item/{item:str}/update")
    async def update_item(self, list_data: GroceryList, item: str, events: Events, data: dict) -> GroceryListItem:
        item_result = await GroceryListItem.get(item)
        if not item_result:
            raise NotFoundException(detail="Item not found.")

        item_result.deep_update(data)
        await item_result.save()
        await events.publish(f"list.{list_data.id_hex}", data={"action": "updateItem"})
        return item_result

    @delete("/item/{item:str}")
    async def delete_item(self, list_data: GroceryList, item: str, events: Events) -> None:
        item_result = await GroceryListItem.get(item)
        if not item_result:
            raise NotFoundException(detail="Item not found.")

        await item_result.delete()
        await events.publish(f"list.{list_data.id_hex}", data={"action": "deleteItem"})
