"""create courts table

Revision ID: 3469289a7e06
Revises: 6458e0bc3e9d
Create Date: 2023-09-11 13:36:28.464161

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "3469289a7e06"
down_revision: str | None = "6458e0bc3e9d"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_table(
        "courts",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("created", sa.DateTime(timezone=True), nullable=False),
        sa.Column("tournament_id", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["tournament_id"],
            ["tournaments.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_courts_id"), "courts", ["id"], unique=False)
    op.add_column("matches", sa.Column("court_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key("matches_courts_fkey", "matches", "courts", ["court_id"], ["id"])
    op.create_index(op.f("ix_courts_tournament_id"), "courts", ["tournament_id"], unique=False)
    op.add_column(
        "tournaments",
        sa.Column("auto_assign_courts", sa.Boolean(), server_default="f", nullable=False),
    )
    op.drop_column("matches", "label")


def downgrade() -> None:
    op.add_column("matches", sa.Column("label", sa.Text(), nullable=True, server_default=""))
    op.alter_column("matches", "label", server_default=None)
    op.drop_column("tournaments", "auto_assign_courts")
    op.drop_index(op.f("ix_courts_tournament_id"), table_name="courts")
    op.drop_constraint("matches_courts_fkey", "matches", type_="foreignkey")
    op.drop_column("matches", "court_id")
    op.drop_index(op.f("ix_courts_id"), table_name="courts")
    op.drop_table("courts")
