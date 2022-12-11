from datetime import datetime
from typing import Any

from heliclockter import datetime_utc
from pydantic import BaseModel

from ladderz.models.db.shared import BaseModelORM


class Tournament(BaseModelORM):
    id: int | None = None
    name: str
    created: datetime_utc
