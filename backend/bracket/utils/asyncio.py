from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Any, ClassVar

from bracket.utils.logging import logger

if TYPE_CHECKING:
    from collections.abc import Awaitable


class AsyncioTasksManager:
    _tasks: ClassVar[set[asyncio.Task[Any]]] = set()

    @classmethod
    def add_coroutine(cls, coroutine: Awaitable[Any]) -> asyncio.Task[Any]:
        task = asyncio.create_task(coroutine)  # type: ignore[var-annotated,arg-type]
        task.add_done_callback(cls._tasks.discard)
        cls._tasks.add(task)
        return task

    @classmethod
    async def gather(cls) -> None:
        if cls._tasks:
            logger.info(f"Cancelling {len(cls._tasks)} tasks")
            for task in cls._tasks:
                task.cancel()
