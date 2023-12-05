from typing import Union
from uuid import UUID, uuid4
from beanie import Document
from pydantic import Field, BaseModel

class BaseDocument(Document):
    id: UUID = Field(default_factory=uuid4)

    @property
    def id_hex(self) -> str:
        return self.id.hex

    @property
    def id_bytes(self) -> bytes:
        return self.id.bytes

    @staticmethod
    def _update(destination: Union[BaseModel, Document],
                source: dict) -> Union[BaseModel, Document]:
        for k, v in source.items():
            if hasattr(destination, k):
                if type(v) == dict:
                    setattr(
                        destination, k, BaseDocument._update(
                            getattr(destination, k), v))
                else:
                    setattr(destination, k, v)
        return destination

    def deep_update(self, source: dict):
        self._update(self, source)
