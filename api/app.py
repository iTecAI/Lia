from litestar import Litestar, MediaType, Request, Response, get
from litestar.di import Provide
from litestar.datastructures.state import State
from util import ApplicationContext
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
from controllers import *

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

    req.app.logger.exception("Encountered an unhandled error:\n")

    return Response(
        media_type=MediaType.TEXT,
        content=detail,
        status_code=status_code,
    )


async def depends_context(state: State) -> ApplicationContext:
    return state["context"]

app = Litestar(route_handlers=[get_test, AuthController], state=State(
    {"context": ApplicationContext()}), lifespan=[setup_context], dependencies={"context": Provide(depends_context)}, exception_handlers={500: exception_logger})
