"""add columns for elimination scheduling

Revision ID: 9ab8db749982
Revises: 85d260b43ad4
Create Date: 2023-11-05 15:07:33.965445

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "9ab8db749982"
down_revision: str | None = "85d260b43ad4"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column("matches", sa.Column("start_time", sa.DateTime(timezone=True), nullable=True))
    op.add_column("matches", sa.Column("duration_minutes", sa.Integer(), nullable=True))
    op.add_column(
        "matches", sa.Column("team1_winner_from_match_id", sa.BigInteger(), nullable=True)
    )
    op.add_column(
        "matches", sa.Column("team2_winner_from_match_id", sa.BigInteger(), nullable=True)
    )

    op.alter_column(
        "matches",
        "team1_position_in_group",
        nullable=True,
        new_column_name="team1_winner_position",
    )
    op.alter_column(
        "matches",
        "team2_position_in_group",
        nullable=True,
        new_column_name="team2_winner_position",
    )
    op.alter_column(
        "matches",
        "team1_stage_item_id",
        nullable=True,
        new_column_name="team1_winner_from_stage_item_id",
    )
    op.alter_column(
        "matches",
        "team2_stage_item_id",
        nullable=True,
        new_column_name="team2_winner_from_stage_item_id",
    )

    op.alter_column(
        "stage_item_inputs",
        "team_stage_item_id",
        nullable=True,
        new_column_name="winner_from_stage_item_id",
    )
    op.alter_column(
        "stage_item_inputs",
        "team_position_in_group",
        nullable=True,
        new_column_name="winner_position",
    )


def downgrade() -> None:
    """Impossible"""
