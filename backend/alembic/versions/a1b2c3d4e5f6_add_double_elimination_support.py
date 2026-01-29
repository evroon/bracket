"""add double elimination support

Revision ID: a1b2c3d4e5f6
Revises: fa53e635f410
Create Date: 2024-01-29 12:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "a1b2c3d4e5f6"
down_revision: str | None = "c1ab44651e79"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # Create bracket_position enum type
    bracket_position_enum = sa.Enum(
        "WINNERS", "LOSERS", "GRAND_FINALS", "NONE", name="bracket_position"
    )
    bracket_position_enum.create(op.get_bind(), checkfirst=True)

    # Add bracket_position column to rounds table
    op.add_column(
        "rounds",
        sa.Column(
            "bracket_position",
            bracket_position_enum,
            nullable=False,
            server_default="NONE",
        ),
    )

    # Add DOUBLE_ELIMINATION to stage_type enum
    op.execute("ALTER TYPE stage_type ADD VALUE IF NOT EXISTS 'DOUBLE_ELIMINATION'")

    # Add loser tracking columns to matches table
    op.add_column(
        "matches",
        sa.Column("stage_item_input1_loser_from_match_id", sa.BigInteger(), nullable=True),
    )
    op.add_column(
        "matches",
        sa.Column("stage_item_input2_loser_from_match_id", sa.BigInteger(), nullable=True),
    )

    # Add foreign key constraints for loser tracking
    op.create_foreign_key(
        "fk_matches_stage_item_input1_loser_from_match_id",
        "matches",
        "matches",
        ["stage_item_input1_loser_from_match_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_matches_stage_item_input2_loser_from_match_id",
        "matches",
        "matches",
        ["stage_item_input2_loser_from_match_id"],
        ["id"],
    )


def downgrade() -> None:
    # Drop foreign key constraints
    op.drop_constraint(
        "fk_matches_stage_item_input1_loser_from_match_id", "matches", type_="foreignkey"
    )
    op.drop_constraint(
        "fk_matches_stage_item_input2_loser_from_match_id", "matches", type_="foreignkey"
    )

    # Drop loser tracking columns
    op.drop_column("matches", "stage_item_input1_loser_from_match_id")
    op.drop_column("matches", "stage_item_input2_loser_from_match_id")

    # Drop bracket_position column from rounds
    op.drop_column("rounds", "bracket_position")

    # Drop bracket_position enum type
    sa.Enum(name="bracket_position").drop(op.get_bind(), checkfirst=True)

    # Note: Cannot remove DOUBLE_ELIMINATION from stage_type enum in PostgreSQL
    # This would require recreating the entire enum type
