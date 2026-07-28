# pylint: disable=redefined-outer-name
import os
from collections.abc import AsyncIterator
from time import sleep

import pytest
import pytest_asyncio

from bracket.database import DatabasePool, database
from bracket.utils.db_init import _create_all_tables, _drop_all_tables
from tests.integration_tests.models import AuthContext
from tests.integration_tests.sql import inserted_auth_context


@pytest_asyncio.fixture(scope="session", autouse=True)
async def reinit_database(worker_id: str) -> AsyncIterator[DatabasePool]:
    """
    Creates the test database on the first test run in the session.

    When running in parallel, the first test runner (gw0) creates a "lock" file and initializes the
    database. The other runners poll this file and wait until it has been removed by gw0.
    When running tests sequentially, the master worker just creates the test database and that's it.
    """
    await database.connect()

    if worker_id == "master":
        _drop_all_tables()
        _create_all_tables()

        try:
            yield database
        finally:
            await database.disconnect()

        return

    lock_path = "/tmp/tm_test_lock"

    if worker_id == "gw0":
        try:
            with open(lock_path, mode="w") as file:
                file.write("")

            _drop_all_tables()
            _create_all_tables()
        finally:
            os.remove(lock_path)
    else:
        for _ in range(50):
            sleep(0.1)
            if not os.path.exists(lock_path):
                break

    try:
        yield database
    finally:
        await database.disconnect()


@pytest.fixture(scope="session")
async def auth_context(reinit_database: DatabasePool) -> AsyncIterator[AuthContext]:
    async with reinit_database, inserted_auth_context() as auth_context:
        yield auth_context
