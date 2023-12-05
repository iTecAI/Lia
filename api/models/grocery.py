from typing import Literal, Optional, Union
from .base import BaseDocument
from pydantic import BaseModel
from open_groceries import GroceryItem


class GroceryList(BaseDocument):
    name: str
    owner_id: str
    included_stores: list[str]
    type: Literal["grocery", "recipe"]

    class Settings:
        name = "grocery_lists"

    async def get_items(self) -> list["GroceryListItem"]:
        return await GroceryListItem.find(
            GroceryListItem.list_id == self.id_hex
        ).to_list()


class QuantitySpec(BaseModel):
    amount: float
    unit: Union[None, str]


class AlternativeSpec(BaseModel):
    alternative_to: str
    index: int


class GroceryListItem(BaseDocument):
    name: str
    list_id: str
    added_by: str
    checked: bool
    quantity: QuantitySpec
    alternative: Optional[AlternativeSpec]
    categories: list[str]
    price: Optional[float]
    location: Optional[str]
    linked_item: Optional[GroceryItem]
    recipe: Optional[str]

    class Settings:
        name = "grocery_items"

    async def get_list(self) -> GroceryList:
        return await GroceryList.get(self.list_id)

    async def get_alternatives(self) -> list["GroceryListItem"]:
        return await self.find(
            GroceryListItem.alternative.alternative_to == self.id_hex
        ).to_list()

    async def get_recipe(self) -> Optional[GroceryList]:
        return await GroceryList.get(self.recipe) if self.recipe else None
