from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from os import getenv, environ
from dataclasses import dataclass
from models import *
from open_groceries import OpenGrocery


@dataclass
class ApplicationOptions:
    mongo_uri: str
    root_user: str
    root_password: str
    recreate_root: bool
    allow_account_creation: bool
    store_location: str
    store_support: list[str]


class ApplicationContext:
    def __init__(self) -> None:
        self.options = self.load_options()
        self.groceries = OpenGrocery(features=self.options.store_support)
        self.groceries.set_nearest_stores(self.options.store_location)
        self.ready = False

    async def setup(self):
        client = AsyncIOMotorClient(self.options.mongo_uri)
        await init_beanie(database=client.lia, document_models=[Session, User])

        root_user = await User.find_one(User.username == self.options.root_user)
        if not root_user or self.options.recreate_root:
            if root_user:
                await User.delete()
            new_root = User.create(
                self.options.root_user, self.options.root_password, admin=True)
            await new_root.insert()

        self.ready = True

    def load_options(self) -> ApplicationOptions:
        print(environ)
        return ApplicationOptions(
            mongo_uri=getenv("MONGO_URI"),
            root_user=getenv("ROOT_USER", "root"),
            root_password=getenv("ROOT_PASSWORD", "root"),
            recreate_root=getenv("RECREATE_ROOT", "false") == "true",
            allow_account_creation=getenv(
                "ALLOW_ACCOUNT_CREATION", "false") == "true",
            store_location=getenv("STORE_LOCATION", "Times Square"),
            store_support=getenv("STORE_SUPPORT", "wegmans,costco").split(",")
        )
