from litestar import Litestar, get
from litestar.datastructures.state import State
from datetime import datetime
from util import ApplicationContext
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator


@asynccontextmanager
async def setup_context(app: Litestar) -> AsyncGenerator[None, None]:
    ctx: ApplicationContext = app.state["context"]
    await ctx.setup()
    try:
        yield
    finally:
        pass


@get("/")
async def get_test() -> datetime:
    return datetime.now()

app = Litestar(route_handlers=[get_test], state=State(
    {"context": ApplicationContext()}), lifespan=[setup_context])
