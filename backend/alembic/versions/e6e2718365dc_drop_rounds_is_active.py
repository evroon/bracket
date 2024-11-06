"""drop rounds.is_active

Revision ID: e6e2718365dc
Revises: 55b14b08be04
Create Date: 2024-11-06 12:02:45.234018

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "e6e2718365dc"
down_revision: str | None = "55b14b08be04"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.drop_column("rounds", "is_active")


def downgrade() -> None:
    op.add_column(
        "rounds",
        sa.Column(
            "is_active",
            sa.BOOLEAN(),
            server_default=sa.text("false"),
            autoincrement=False,
            nullable=False,
        ),
    )
