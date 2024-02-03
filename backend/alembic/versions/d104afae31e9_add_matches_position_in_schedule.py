"""add matches.position_in_schedule

Revision ID: d104afae31e9
Revises: 9ab8db749982
Create Date: 2023-11-07 11:04:45.724852

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "d104afae31e9"
down_revision: str | None = "9ab8db749982"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("matches", sa.Column("position_in_schedule", sa.Integer(), nullable=True))
    op.add_column(
        "tournaments",
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False, server_default="now()"),
    )


def downgrade() -> None:
    op.drop_column("tournaments", "start_time")
    op.drop_column("matches", "position_in_schedule")
