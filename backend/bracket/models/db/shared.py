from typing import Any

from pydantic import BaseModel, ConfigDict


class BaseModelORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    def model_dump(self, **kwargs: Any) -> Any:
        kwargs["exclude_none"] = True
        return super().model_dump(**kwargs)
