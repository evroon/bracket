"""Add user to club relation and account type

Revision ID: e79c4266daa4
Revises: 4768424dd787
Create Date: 2024-01-17 17:33:27.047653

"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "e79c4266daa4"
down_revision: str | None = "4768424dd787"
branch_labels: str | None = None
depends_on: str | None = None


user_x_club_relation = ENUM("OWNER", "COLLABORATOR", name="user_x_club_relation", create_type=True)
account_type = ENUM("REGULAR", "DEMO", name="account_type", create_type=True)


def upgrade() -> None:
    account_type.create(op.get_bind(), checkfirst=False)
    user_x_club_relation.create(op.get_bind(), checkfirst=False)

    op.add_column(
        "users", sa.Column("account_type", account_type, server_default="REGULAR", nullable=False)
    )
    op.add_column(
        "users_x_clubs",
        sa.Column("relation", user_x_club_relation, server_default="OWNER", nullable=False),
    )


def downgrade() -> None:
    op.drop_column("users_x_clubs", "relation")
    op.drop_column("users", "account_type")

    user_x_club_relation.drop(op.get_bind(), checkfirst=False)
    account_type.drop(op.get_bind(), checkfirst=False)
