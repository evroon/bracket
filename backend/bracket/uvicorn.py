import os
import signal
import threading
import time
from typing import Any

from uvicorn.workers import UvicornWorker


class ReloaderThread(threading.Thread):
    def __init__(self, worker: UvicornWorker, sleep_interval: float = 1.0):
        super().__init__()
        self._worker = worker
        self._interval = sleep_interval

    def run(self) -> None:
        while True:
            if not self._worker.alive:
                os.kill(os.getpid(), signal.SIGINT)
            time.sleep(self._interval)


class RestartableUvicornWorker(UvicornWorker):
    def __init__(self, *args: list[Any], **kwargs: dict[str, Any]):
        super().__init__(*args, **kwargs)
        self._reloader_thread = ReloaderThread(self)

    def run(self) -> None:
        if self.cfg.reload:
            self._reloader_thread.start()
        super().run()
