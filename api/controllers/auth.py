from typing import Annotated, Optional
from litestar import Controller, get, post, Response
from litestar.params import Parameter
from litestar.datastructures import Cookie
from models import Session, User
from util import ApplicationContext
from uuid import UUID
from datetime import datetime


class AuthController(Controller):
    path = "/auth"

    @get("/session", response_cookies=[
        Cookie(
            key="lia-token",
            description="A unique token value (UUIDv4)",
            documentation_only=True,
        )
    ])
    async def get_session(self, token: Annotated[Optional[str], Parameter(cookie="lia-token")] = None) -> Session:
        if token == None:
            new_session = Session(user_id=None, last_request=datetime.now())
            await new_session.insert()
            return Response(
                new_session,
                cookies=[Cookie(key="lia-token", value=new_session.id)]
            )

        else:
            result = await Session.get(token)
            if result == None:
                new_session = Session(
                    user_id=None, last_request=datetime.now())
                await new_session.insert()
                return Response(
                    new_session,
                    cookies=[Cookie(key="lia-token", value=new_session.id)]
                )
            else:
                return Response(
                    result,
                    cookies=[Cookie(key="lia-token", value=result.id)]
                )
