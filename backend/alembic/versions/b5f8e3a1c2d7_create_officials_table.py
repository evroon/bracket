"""create officials table

Revision ID: b5f8e3a1c2d7
Revises: ae0f9c2d7b31
Create Date: 2026-01-30 00:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "b5f8e3a1c2d7"
down_revision: str | None = "ae0f9c2d7b31"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_table(
        "officials",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("access_code", sa.String(8), nullable=False),
        sa.Column(
            "created",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column("tournament_id", sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(
            ["tournament_id"],
            ["tournaments.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("access_code"),
    )
    op.create_index(op.f("ix_officials_id"), "officials", ["id"], unique=False)
    op.create_index(
        op.f("ix_officials_tournament_id"), "officials", ["tournament_id"], unique=False
    )
    op.add_column("matches", sa.Column("official_id", sa.BigInteger(), nullable=True))
    op.create_foreign_key(
        "matches_officials_fkey", "matches", "officials", ["official_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("matches_officials_fkey", "matches", type_="foreignkey")
    op.drop_column("matches", "official_id")
    op.drop_index(op.f("ix_officials_tournament_id"), table_name="officials")
    op.drop_index(op.f("ix_officials_id"), table_name="officials")
    op.drop_table("officials")
