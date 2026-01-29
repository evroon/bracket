"""create tournament_breaks table

Revision ID: ae0f9c2d7b31
Revises: a1b2c3d4e5f6
Create Date: 2026-01-29 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "ae0f9c2d7b31"
down_revision: str | None = "a1b2c3d4e5f6"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_table(
        "tournament_breaks",
        sa.Column("id", sa.BigInteger, primary_key=True, index=True),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "tournament_id",
            sa.BigInteger,
            sa.ForeignKey("tournaments.id"),
            nullable=False,
            index=True,
        ),
    )


def downgrade() -> None:
    op.drop_table("tournament_breaks")
