"""create tournaments.dashboard_endpoint

Revision ID: 85d260b43ad4
Revises: 42683f6c1c45
Create Date: 2023-09-26 21:07:50.586942

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "85d260b43ad4"
down_revision: str | None = "42683f6c1c45"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("tournaments", sa.Column("dashboard_endpoint", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("tournaments", "dashboard_endpoint")
