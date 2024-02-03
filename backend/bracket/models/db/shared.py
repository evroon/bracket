from datetime import datetime
from typing import Any

from heliclockter import datetime_utc
from pydantic import BaseModel


class BaseModelORM(BaseModel):
    class Config:
        orm_mode = True

    def dict(self, **kwargs: Any) -> Any:
        kwargs["exclude_none"] = True
        result = super().dict(**kwargs)
        for k, v in result.items():
            if isinstance(v, datetime_utc):
                result[k] = datetime.fromisoformat(v.isoformat())

        return result
