from datetime import datetime
from typing import Literal, Optional
from .base import BaseDocument
from secrets import token_urlsafe
from .grocery import GroceryList


class AccountCreationInvite(BaseDocument):
    type: Literal["create_account"] = "create_account"
    uri: str
    uses_remaining: Optional[int] = None
    expires: Optional[datetime] = None

    class Settings:
        name = "invites"

    @classmethod
    def create(
            cls,
            uses_remaining: int = None,
            expires: datetime = None) -> "AccountCreationInvite":
        return AccountCreationInvite(
            type="create_account",
            uri=token_urlsafe(nbytes=12),
            uses_remaining=uses_remaining,
            expires=expires
        )

    @classmethod
    async def get_uri(cls, uri: str) -> Optional["AccountCreationInvite"]:
        return await AccountCreationInvite.find_one(AccountCreationInvite.type == "create_account" and AccountCreationInvite.uri == uri)


class ListInvite(BaseDocument):
    type: Literal["list"] = "list"
    uri: str
    reference: str

    class Settings:
        name = "invites"

    @classmethod
    def create(cls, reference: GroceryList) -> "ListInvite":
        return ListInvite(
            type="list",
            uri=token_urlsafe(nbytes=12),
            reference=reference.id_hex
        )

    @classmethod
    async def get_uri(cls, uri: str) -> Optional["ListInvite"]:
        return await ListInvite.find_one(ListInvite.type == "list" and ListInvite.uri == uri)

