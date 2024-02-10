"""create custom match duration fields

Revision ID: 8bae62f80db7
Revises: d104afae31e9
Create Date: 2023-11-19 15:05:51.284093

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "8bae62f80db7"
down_revision: str | None = "d104afae31e9"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("matches", sa.Column("margin_minutes", sa.Integer(), nullable=True))
    op.add_column("matches", sa.Column("custom_duration_minutes", sa.Integer(), nullable=True))
    op.add_column("matches", sa.Column("custom_margin_minutes", sa.Integer(), nullable=True))
    op.add_column(
        "tournaments", sa.Column("margin_minutes", sa.Integer(), server_default="5", nullable=False)
    )


def downgrade() -> None:
    op.drop_column("tournaments", "margin_minutes")
    op.drop_column("matches", "custom_margin_minutes")
    op.drop_column("matches", "custom_duration_minutes")
    op.drop_column("matches", "margin_minutes")
