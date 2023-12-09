from datetime import datetime
from typing import Literal, Optional, Union
from litestar import Controller, get, post, delete
from litestar.di import Provide
from litestar.exceptions import *
from models import guard_logged_in, depends_user, User, AccountCreationInvite, ListInvite, GroceryList


class InviteController(Controller):
    path = "/invites"
    guards = [guard_logged_in]
    dependencies = {"user": Provide(depends_user)}

    @post("/account_creation")
    async def create_invite_account_creation(self, user: User, expires: Optional[datetime] = None, uses: Optional[int] = None) -> AccountCreationInvite:
        if not user.admin:
            raise NotAuthorizedException(
                detail="Account invites cannot be created by non-admin users.")

        new_invite = AccountCreationInvite.create(
            uses_remaining=uses,
            expires=expires
        )
        await new_invite.save()
        return new_invite

    @post("/list/{list_id: str}")
    async def create_invite_list(self, user: User, list_id: str) -> ListInvite:
        referenced_list = await GroceryList.get(list_id)
        if not referenced_list:
            raise NotFoundException(detail="List not found.")

        if referenced_list.owner_id != user.id_hex:
            raise MethodNotAllowedException(
                detail="You do not own the referenced list.")

        new_invite = ListInvite.create(referenced_list)
        await new_invite.save()
        return new_invite

    @get("/{invite_type:str}/{uri:str}")
    async def get_invite(self, invite_type: Literal["account", "list"], uri: str) -> Union[AccountCreationInvite, ListInvite]:
        if invite_type == "account":
            result = await AccountCreationInvite.get_uri(uri)
        else:
            result = await ListInvite.get_uri(uri)

        if not result:
            raise NotFoundException(detail="Invite URI not found.")

        return result
