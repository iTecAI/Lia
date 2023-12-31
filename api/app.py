from typing import Union
from litestar import Litestar, MediaType, Request, Response, get
from litestar.di import Provide
from litestar.datastructures.state import State
from util import ApplicationContext, Events
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from controllers import *
from models import *
from datetime import datetime
from traceback import format_exc

from litestar.channels import ChannelsPlugin
from litestar.channels.backends.memory import MemoryChannelsBackend


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
        "allow_account_creation": context.options.allow_account_creation,
    }


def exception_logger(req: Request, exc: Exception) -> Response:
    """Default handler for exceptions subclassed from HTTPException."""
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", "")

    print(f"Encountered an error: {str(exc)}\n" + format_exc())

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )


async def depends_context(state: State) -> ApplicationContext:
    return state["context"]


async def depends_session(
    context: ApplicationContext, request: Request
) -> Union[Session, None]:
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


async def depends_events(state: State) -> Events:
    return state["events"]


channels = ChannelsPlugin(
    MemoryChannelsBackend(history=16),
    arbitrary_channels_allowed=True,
    create_ws_route_handlers=True,
    ws_handler_send_history=8,
    ws_handler_base_path="/events",
)


app = Litestar(
    route_handlers=[
        get_test,
        AuthController,
        ListController,
        UserController,
        ListsController,
        GroceryController,
        InviteController
    ],
    state=State({"context": ApplicationContext(), "events": Events(channels)}),
    lifespan=[setup_context],
    dependencies={
        "context": Provide(depends_context),
        "session": Provide(depends_session),
        "events": Provide(depends_events),
    },
    exception_handlers={500: exception_logger},
    plugins=[channels],
)
