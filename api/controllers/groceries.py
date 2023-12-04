from litestar import Controller, get
from models import guard_logged_in
from open_groceries import GroceryItem
from util import ApplicationContext


class GroceryController(Controller):
    path = "/groceries"
    guards = [guard_logged_in]

    @get("/search")
    async def search_groceries(
        self, context: ApplicationContext, stores: str, term: str
    ) -> list[GroceryItem]:
        results = context.groceries.search(
            term, include=stores.split(","), ignore_errors=True
        )
        return results
