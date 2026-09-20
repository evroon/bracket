"""add players.email

Revision ID: 2dd38dcccc97
Revises: c1ab44651e79
Create Date: 2026-08-25 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "2dd38dcccc97"
down_revision: str | None = "c1ab44651e79"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("players", sa.Column("email", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("players", "email")