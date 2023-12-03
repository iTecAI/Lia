from typing import Union
from litestar import Litestar, MediaType, Request, Response, get
from litestar.di import Provide
from litestar.datastructures.state import State
from util import ApplicationContext
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from controllers import *
from models import *
from datetime import datetime

@asynccontextmanager
async def setup_context(app: Litestar) -> AsyncGenerator[None, None]:
    ctx: ApplicationContext = app.state["context"]
    await ctx.setup()
    try:
        yield
    finally:
        pass


@get("/")
async def get_test(context: ApplicationContext) -> dict:
    return {
        "store_location": context.options.store_location,
        "store_support": context.options.store_support,
        "allow_account_creation": context.options.allow_account_creation
    }


def exception_logger(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", "")

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )


async def depends_context(state: State) -> ApplicationContext:
    return state["context"]


async def depends_session(context: ApplicationContext, request: Request) -> Union[Session, None]:
    token = request.cookies.get("lia-token")
    if token:
        session = await Session.get(token)
        if session:
            session.last_request = datetime.now()
            await session.save()
            return session
        return None
    else:
        return None

app = Litestar(route_handlers=[get_test, AuthController], state=State(
    {"context": ApplicationContext()}), lifespan=[setup_context], dependencies={"context": Provide(depends_context), "session": Provide(depends_session)}, exception_handlers={500: exception_logger})
