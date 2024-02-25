"""Adding teams.logo_paths

Revision ID: 19ddf67a4eeb
Revises: c08e04993dd7
Create Date: 2024-02-24 12:14:16.037628

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "19ddf67a4eeb"
down_revision: str | None = "c08e04993dd7"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("teams", sa.Column("logo_path", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("teams", "logo_path")
