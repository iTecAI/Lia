from datetime import datetime
from typing import Literal, Optional
from .base import BaseDocument


class Invite(BaseDocument):
    invite_link: str
    target_type: Literal["list", "account"]
    target_reference: Optional[str]
    uses_remaining: Optional[int]
    expires: Optional[datetime]
    owner: str

    class Settings:
        name = "invites"
