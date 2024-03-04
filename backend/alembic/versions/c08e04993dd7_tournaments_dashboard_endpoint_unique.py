"""tournaments.dashboard_endpoint unique

Revision ID: c08e04993dd7
Revises: 39ec08a054af
Create Date: 2024-02-09 18:44:32.138133

"""

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "c08e04993dd7"
down_revision: str | None = "39ec08a054af"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_index(
        op.f("ix_tournaments_dashboard_endpoint"),
        "tournaments",
        ["dashboard_endpoint"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_tournaments_dashboard_endpoint"), table_name="tournaments")
