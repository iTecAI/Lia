from typing import Literal, Optional
from .base import BaseDocument
from .grocery import GroceryList
from pydantic import BaseModel

class AccessReference(BaseModel):
    type: Literal["id", "alias"]
    reference: str

class Favorite(BaseDocument):
    user_id: str
    reference: AccessReference

    async def resolve(self) -> Optional[GroceryList]:
        if self.reference.type == "id":
            return await GroceryList.get(self.reference.reference)
        return None
    
    class Settings:
        name = "favorites"