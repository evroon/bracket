from datetime import datetime
from typing import Any

from heliclockter import datetime_utc
from pydantic import BaseModel, ConfigDict


class BaseModelORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    def dict(self, **kwargs: Any) -> Any:
        kwargs["exclude_none"] = True
        result = super().model_dump(**kwargs)
        for k, v in result.items():
            if isinstance(v, datetime_utc):
                result[k] = datetime.fromisoformat(v.isoformat())

        return result
