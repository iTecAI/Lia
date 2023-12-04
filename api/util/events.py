from typing import Any, AsyncGenerator
from litestar.channels import ChannelsPlugin


class Events:
    def __init__(self, channels: ChannelsPlugin) -> None:
        self.channels = channels

    async def publish(self, event: str, data: Any = None):
        await self.channels.wait_published(data, event)

    async def subscribe(self, event: str) -> AsyncGenerator:
        async with self.channels.subscribe(event) as subscriber:
            async for i in subscriber.iter_events():
                yield i
