from bracket.database import database
from bracket.utils.errors import (
    foreign_key_violation_error_lookup,
    unique_index_violation_error_lookup,
)


async def test_all_unique_indices_in_lookup() -> None:
    query = """
    SELECT
        idx.relname AS index_name
    FROM pg_index pgi
        JOIN pg_class idx ON idx.oid = pgi.indexrelid
        JOIN pg_namespace insp ON insp.oid = idx.relnamespace
        JOIN pg_class tbl ON tbl.oid = pgi.indrelid
        JOIN pg_namespace tnsp ON tnsp.oid = tbl.relnamespace
    WHERE pgi.indisunique
        AND tnsp.nspname = 'public'
        AND idx.relname NOT LIKE '%_pkey'
        AND idx.relname !='alembic_version_pkc'
    """
    result = await database.fetch_all(query)
    indices = {ix.index_name for ix in result}  # type: ignore[attr-defined]

    expected_indices = {ix.name for ix in unique_index_violation_error_lookup.keys()}
    assert indices == expected_indices


async def test_known_foreign_keys_in_lookup() -> None:
    query = """
        SELECT conrelid::regclass AS table_name,
               conname AS foreign_key
        FROM   pg_constraint
        WHERE  contype = 'f'
        AND    connamespace = 'public'::regnamespace
        ORDER  BY conrelid::regclass::text, contype DESC;
    """
    result = await database.fetch_all(query)
    indices = {ix.foreign_key for ix in result}  # type: ignore[attr-defined]

    for foreign_key in foreign_key_violation_error_lookup.keys():
        msg = f"Unexpected foreign key in lookup: {foreign_key.value}"
        assert foreign_key.name in indices, msg
