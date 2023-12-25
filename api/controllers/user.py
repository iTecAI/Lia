from typing import Literal, Optional
from uuid import UUID
from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import NotFoundException, MethodNotAllowedException
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
        favorites = [i.reference.reference for i in await user.get_favorites()]

        results: list[ListAccessSpec] = []
        results.extend(
            [
                ListAccessSpec(
                    data=i,
                    access_type="id",
                    access_reference=i.id_hex,
                    favorited=i.id_hex in favorites,
                )
                for i in await GroceryList.find(
                    GroceryList.owner_id == user.id_hex
                ).to_list()
            ]
        )

        joined_lists = await JoinedList.find(
            JoinedList.user_id == user.id_hex
        ).to_list()
        joined_invites = await ListInvite.find(
            {"uri": {"$in": [j.invite_uri for j in joined_lists]}}
        ).to_list()
        invite_mapping = {i.reference: i.uri for i in joined_invites}
        joined_list_data = (
            await GroceryList.find(
                {"_id": {"$in": [UUID(hex=i.reference) for i in joined_invites]}}
            ).to_list()
            if len(joined_invites) > 0
            else []
        )

        results.extend(
            [
                ListAccessSpec(
                    data=i,
                    access_type="alias",
                    access_reference=invite_mapping[i.id_hex],
                    favorited=i.id_hex in favorites,
                )
                for i in joined_list_data
            ]
        )

        return results

    @get("/favorites")
    async def get_user_favorites(self, user: User) -> list[Favorite]:
        return await user.get_favorites()

    @post("/favorites/{type:str}/{reference:str}")
    async def toggle_favorite(
        self, user: User, type: Literal["id", "alias"], reference: str
    ) -> Optional[Favorite]:
        result = await Favorite.find_one(
            Favorite.user_id == user.id_hex
            and Favorite.reference.type == type
            and Favorite.reference.reference == reference
        )
        if result:
            await result.delete()
            return None
        else:
            new_favorite = Favorite(
                user_id=user.id_hex,
                reference=AccessReference(type=type, reference=reference),
            )
            await new_favorite.save()
            return new_favorite

    @post("/join/{alias:str}")
    async def join_list_or_recipe(self, user: User, alias: str) -> JoinedList:
        invite = await ListInvite.get_uri(alias)
        if not invite:
            raise NotFoundException(detail=f"List with alias {alias} not found.")

        result = await GroceryList.get(invite.reference)
        if not result:
            raise NotFoundException(detail=f"List with alias {alias} not found.")

        if result.owner_id == user.id_hex:
            raise MethodNotAllowedException(
                detail="Cannot join a list you already own."
            )

        joined = JoinedList(user_id=user.id_hex, invite_uri=alias)
        await joined.save()
        return joined
