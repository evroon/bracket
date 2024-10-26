"""add unique constraints to stage_item_inputs

Revision ID: c97976608633
Revises: 8d7ab856d95f
Create Date: 2024-10-26 15:29:26.585658

"""

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "c97976608633"
down_revision: str | None = "8d7ab856d95f"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.create_unique_constraint(
        "stage_item_inputs_stage_item_id_team_id_key",
        "stage_item_inputs",
        ["stage_item_id", "team_id"],
    )
    op.create_unique_constraint(
        "stage_item_inputs_stage_item_id_winner_from_stage_item_id_w_key",
        "stage_item_inputs",
        ["stage_item_id", "winner_from_stage_item_id", "winner_position"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "stage_item_inputs_stage_item_id_winner_from_stage_item_id_w_key",
        "stage_item_inputs",
        type_="unique",
    )
    op.drop_constraint(
        "stage_item_inputs_stage_item_id_team_id_key",
        "stage_item_inputs",
        type_="unique",
    )
