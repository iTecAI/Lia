from uuid import UUID, uuid4
from beanie import Document
from pydantic import Field


class BaseDocument(Document):
    id: UUID = Field(default_factory=uuid4)

    @property
    def id_hex(self) -> str:
        return self.id.hex

    @property
    def id_bytes(self) -> bytes:
        return self.id.bytes
