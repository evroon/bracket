"""remove stages.status

Revision ID: 42683f6c1c45
Revises: 3469289a7e06
Create Date: 2023-09-14 13:55:18.327147

"""

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ENUM

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "42683f6c1c45"
down_revision: str | None = "3469289a7e06"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.drop_column("stages", "status")


def downgrade() -> None:
    op.add_column(
        "stages",
        sa.Column(
            "status",
            ENUM(
                "COMPLETED",
                "ACTIVE",
                "INACTIVE",
                name="stage_status",
                create_type=True,
            ),
            nullable=False,
        ),
    )
