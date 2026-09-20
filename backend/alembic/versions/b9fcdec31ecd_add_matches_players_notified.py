"""add matches.players_notified

Revision ID: b9fcdec31ecd
Revises: 2dd38dcccc97
Create Date: 2026-09-03 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "b9fcdec31ecd"
down_revision: str | None = "2dd38dcccc97"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column(
        "matches",
        sa.Column("players_notified", sa.Boolean(), nullable=False, server_default="false"),
    )


def downgrade() -> None:
    op.drop_column("matches", "players_notified")