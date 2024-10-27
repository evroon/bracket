"""add conflict columns to matches

Revision ID: 55b14b08be04
Revises: c97976608633
Create Date: 2024-10-27 17:24:00.240033

"""

import sqlalchemy as sa
from sqlalchemy import text

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "55b14b08be04"
down_revision: str | None = "c97976608633"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("matches", sa.Column("stage_item_input1_conflict", sa.Boolean(), nullable=True))
    op.add_column("matches", sa.Column("stage_item_input2_conflict", sa.Boolean(), nullable=True))
    op.execute(
        text(
            "UPDATE matches SET stage_item_input1_conflict=false, stage_item_input2_conflict=false"
        )
    )
    op.alter_column("matches", "stage_item_input2_conflict", nullable=False)
    op.alter_column("matches", "stage_item_input2_conflict", nullable=False)


def downgrade() -> None:
    op.drop_column("matches", "stage_item_input2_conflict")
    op.drop_column("matches", "stage_item_input1_conflict")
