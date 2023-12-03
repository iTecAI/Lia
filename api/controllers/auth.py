from typing import Annotated, Optional
from litestar import Controller, get, post, Response
from litestar.params import Parameter
from litestar.exceptions import *
from litestar.status_codes import *
from litestar.datastructures import Cookie
from models import Session, User, RedactedUser, guard_session, guard_logged_in, depends_user
from datetime import datetime
from pydantic import BaseModel


class LoginModel(BaseModel):
    username: str
    password: str


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

    @post("/login", guards=[guard_session])
    async def auth_login(self, session: Session, data: LoginModel) -> RedactedUser:
        result = await User.find_one(User.username == data.username)
        if not result:
            raise NotFoundException(detail="username/password incorrect")

        valid = result.password.verify(data.password)
        if not valid:
            raise NotFoundException(detail="username/password incorrect")

        session.user_id = result.id_hex
        await session.save()
        return result.redacted

    @post("/logout", guards=[guard_logged_in], status_code=HTTP_204_NO_CONTENT)
    async def auth_logout(self, session: Session) -> None:
        session.user_id = None
        await session.save()
        return None
