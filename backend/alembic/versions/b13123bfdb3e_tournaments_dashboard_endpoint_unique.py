"""tournaments.dashboard_endpoint unique

Revision ID: b13123bfdb3e
Revises: 39ec08a054af
Create Date: 2024-02-09 17:37:05.285469

"""


from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "b13123bfdb3e"
down_revision: str | None = "39ec08a054af"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_unique_constraint("dashboard_endpoint_unique", "tournaments", ["dashboard_endpoint"])


def downgrade() -> None:
    op.drop_constraint("dashboard_endpoint_unique", "tournaments", type_="unique")
