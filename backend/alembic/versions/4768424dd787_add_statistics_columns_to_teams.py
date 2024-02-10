"""add statistics columns to teams

Revision ID: 4768424dd787
Revises: fa53e635f410
Create Date: 2023-11-28 18:13:55.483401

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "4768424dd787"
down_revision: str | None = "fa53e635f410"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("teams", sa.Column("elo_score", sa.Float(), nullable=False, server_default="0"))
    op.add_column("teams", sa.Column("swiss_score", sa.Float(), nullable=False, server_default="0"))
    op.add_column("teams", sa.Column("wins", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("teams", sa.Column("draws", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("teams", sa.Column("losses", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("teams", "losses")
    op.drop_column("teams", "draws")
    op.drop_column("teams", "wins")
    op.drop_column("teams", "swiss_score")
    op.drop_column("teams", "elo_score")
