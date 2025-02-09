"""add tournaments.status

Revision ID: c1ab44651e79
Revises: e6e2718365dc
Create Date: 2025-02-09 11:06:32.622324

"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "c1ab44651e79"
down_revision: str | None = "e6e2718365dc"
branch_labels: str | None = None
depends_on: str | None = None

enum = ENUM("OPEN", "ARCHIVED", name="tournament_status", create_type=True)


def upgrade() -> None:
    enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "tournaments", sa.Column("status", enum, server_default="OPEN", nullable=False, index=True)
    )


def downgrade() -> None:
    op.drop_column("tournaments", "status")
    enum.drop(op.get_bind())
