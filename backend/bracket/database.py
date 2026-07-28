from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from contextvars import ContextVar
from typing import Any

import asyncpg
from heliclockter import datetime_utc

from bracket.config import config


def datetime_decoder(value: str) -> datetime_utc:
    value = value.split(".")[0].replace("+00", "+00:00")
    return datetime_utc.fromisoformat(value)


async def _init_connection(connection: asyncpg.Connection) -> None:  # type: ignore[type-arg]
    for timestamp_type in ("timestamp", "timestamptz"):
        await connection.set_type_codec(
            timestamp_type,
            encoder=datetime_utc.isoformat,
            decoder=datetime_decoder,
            schema="pg_catalog",
        )


def _convert_named_params(query: str, values: dict[str, Any]) -> tuple[str, list[Any]]:
    """Convert :param style parameters to $1, $2, ... style for asyncpg."""
    params: list[Any] = []
    result = query
    # Sort keys by length (longest first) to avoid partial replacements
    sorted_keys = sorted(values.keys(), key=len, reverse=True)
    # First pass: replace all :param with unique placeholders
    placeholders: dict[str, str] = {}
    for key in sorted_keys:
        placeholder = f"\x00PARAM_{key}\x00"
        placeholders[key] = placeholder
        result = result.replace(f":{key}", placeholder)
    # Second pass: replace placeholders with $N
    for key in sorted_keys:
        placeholder = placeholders[key]
        if placeholder in result:
            params.append(values[key])
            idx = len(params)
            result = result.replace(placeholder, f"${idx}", 1)
            # Handle multiple occurrences of same param
            while placeholder in result:
                params.append(values[key])
                idx = len(params)
                result = result.replace(placeholder, f"${idx}", 1)
    return result, params


# Context variable to track the current transaction connection
_transaction_connection: ContextVar[asyncpg.Connection | None] = ContextVar(  # type: ignore[type-arg]
    "_transaction_connection", default=None
)


class _Transaction:
    """Context manager for database transactions."""

    def __init__(self, pool: asyncpg.Pool) -> None:  # type: ignore[type-arg]
        self._pool = pool
        self._connection: asyncpg.Connection | None = None  # type: ignore[type-arg]
        self._transaction: asyncpg.connection.transaction.Transaction | None = None
        self._token: Any = None

    async def __aenter__(self) -> "_Transaction":
        self._connection = await self._pool.acquire()
        self._transaction = self._connection.transaction()
        await self._transaction.start()
        self._token = _transaction_connection.set(self._connection)
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        assert self._connection is not None
        assert self._transaction is not None
        assert self._token is not None
        try:
            if exc_type is not None:
                await self._transaction.rollback()
            else:
                await self._transaction.commit()
        finally:
            _transaction_connection.reset(self._token)
            await self._pool.release(self._connection)


class DatabasePool:
    """asyncpg-based database wrapper providing an interface compatible with
    the old `databases.Database` usage in this codebase."""

    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: asyncpg.Pool | None = None  # type: ignore[type-arg]

    async def connect(self) -> None:
        self._pool = await asyncpg.create_pool(self._dsn, init=_init_connection)

    async def disconnect(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    @property
    def pool(self) -> asyncpg.Pool:  # type: ignore[type-arg]
        assert self._pool is not None, "Database pool is not initialized. Call connect() first."
        return self._pool

    def _get_conn(self) -> asyncpg.Connection | asyncpg.Pool:  # type: ignore[type-arg]
        """Return the transaction connection if inside a transaction, otherwise the pool."""
        conn = _transaction_connection.get()
        if conn is not None:
            return conn
        return self.pool

    async def fetch_one(
        self, query: str, values: dict[str, Any] | None = None
    ) -> asyncpg.Record | None:
        conn = self._get_conn()
        if values:
            converted_query, params = _convert_named_params(query, values)
            return await conn.fetchrow(converted_query, *params)
        return await conn.fetchrow(query)

    async def fetch_all(
        self, query: str, values: dict[str, Any] | None = None
    ) -> list[asyncpg.Record]:
        conn = self._get_conn()
        if values:
            converted_query, params = _convert_named_params(query, values)
            return await conn.fetch(converted_query, *params)
        return await conn.fetch(query)

    async def fetch_val(
        self, query: str, values: dict[str, Any] | None = None, column: int = 0
    ) -> Any:
        conn = self._get_conn()
        if values:
            converted_query, params = _convert_named_params(query, values)
            return await conn.fetchval(converted_query, *params, column=column)
        return await conn.fetchval(query, column=column)

    async def execute(self, query: str, values: dict[str, Any] | None = None) -> str:
        conn = self._get_conn()
        if values:
            converted_query, params = _convert_named_params(query, values)
            return await conn.execute(converted_query, *params)
        return await conn.execute(query)

    def transaction(self) -> _Transaction:
        return _Transaction(self.pool)

    @asynccontextmanager
    async def acquire(self) -> AsyncIterator[asyncpg.Connection]:  # type: ignore[type-arg]
        async with self.pool.acquire() as conn:
            yield conn

    async def __aenter__(self) -> "DatabasePool":
        return self

    async def __aexit__(self, *args: Any) -> None:
        pass


database = DatabasePool(str(config.pg_dsn))
