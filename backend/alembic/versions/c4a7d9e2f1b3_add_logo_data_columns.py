"""add logo_data columns

Revision ID: c4a7d9e2f1b3
Revises: b5f8e3a1c2d7
Create Date: 2026-01-30 00:00:00.000000

"""

import os

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "c4a7d9e2f1b3"
down_revision = "b5f8e3a1c2d7"
branch_labels = None
depends_on = None


def _migrate_existing_files(connection: sa.Connection) -> None:
    """Read existing logo files from disk and store them in the database."""
    # Migrate tournament logos
    rows = connection.execute(
        sa.text("SELECT id, logo_path FROM tournaments WHERE logo_path IS NOT NULL")
    ).fetchall()
    for row in rows:
        file_path = os.path.join("static", "tournament-logos", row[1])
        if not os.path.exists(file_path):
            continue
        with open(file_path, "rb") as f:
            data = f.read()
        ext = os.path.splitext(row[1])[1].lower()
        content_type = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}.get(
            ext, "application/octet-stream"
        )
        connection.execute(
            sa.text(
                "UPDATE tournaments SET logo_data = :data, logo_content_type = :ct WHERE id = :id"
            ),
            {"data": data, "ct": content_type, "id": row[0]},
        )

    # Migrate team logos
    rows = connection.execute(
        sa.text("SELECT id, logo_path FROM teams WHERE logo_path IS NOT NULL")
    ).fetchall()
    for row in rows:
        file_path = os.path.join("static", "team-logos", row[1])
        if not os.path.exists(file_path):
            continue
        with open(file_path, "rb") as f:
            data = f.read()
        ext = os.path.splitext(row[1])[1].lower()
        content_type = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}.get(
            ext, "application/octet-stream"
        )
        connection.execute(
            sa.text(
                "UPDATE teams SET logo_data = :data, logo_content_type = :ct WHERE id = :id"
            ),
            {"data": data, "ct": content_type, "id": row[0]},
        )


def upgrade() -> None:
    op.add_column("tournaments", sa.Column("logo_data", sa.LargeBinary(), nullable=True))
    op.add_column("tournaments", sa.Column("logo_content_type", sa.String(), nullable=True))
    op.add_column("teams", sa.Column("logo_data", sa.LargeBinary(), nullable=True))
    op.add_column("teams", sa.Column("logo_content_type", sa.String(), nullable=True))

    connection = op.get_bind()
    _migrate_existing_files(connection)


def downgrade() -> None:
    op.drop_column("teams", "logo_content_type")
    op.drop_column("teams", "logo_data")
    op.drop_column("tournaments", "logo_content_type")
    op.drop_column("tournaments", "logo_data")
