"""don't refer to teams in matches table

Revision ID: 8d7ab856d95f
Revises: 77de1c773dba
Create Date: 2024-09-11 20:30:38.520644

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "8d7ab856d95f"
down_revision: str | None = "77de1c773dba"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # Rename columns for which we don't need to change foreign keys
    op.execute("ALTER TABLE matches RENAME COLUMN team1_score TO stage_item_input1_score")
    op.execute("ALTER TABLE matches RENAME COLUMN team2_score TO stage_item_input2_score")

    op.execute(
        "ALTER TABLE matches "
        "RENAME COLUMN team1_winner_from_match_id TO stage_item_input1_winner_from_match_id"
    )
    op.execute(
        "ALTER TABLE matches "
        "RENAME COLUMN team2_winner_from_match_id TO stage_item_input2_winner_from_match_id"
    )

    # Change foreign keys
    op.add_column("matches", sa.Column("stage_item_input1_id", sa.BigInteger(), nullable=True))
    op.add_column("matches", sa.Column("stage_item_input2_id", sa.BigInteger(), nullable=True))

    # Fill stage item input ids
    matches = op.get_bind().execute("SELECT id, team1_id, team2_id FROM matches").fetchall()
    stage_item_inputs = (
        op.get_bind().execute("SELECT id, team_id FROM stage_item_inputs").fetchall()
    )
    stage_item_inputs = {input["team_id"]: input["id"] for input in stage_item_inputs}
    for match in matches:
        op.get_bind().execute(
            sa.text(
                """
            UPDATE matches
            SET stage_item_input1_id = :input1_id,
                stage_item_input2_id = :input2_id
            WHERE id = :match_id
            """
            ),
            input1_id=stage_item_inputs[match["team1_id"]],
            input2_id=stage_item_inputs[match["team2_id"]],
            match_id=match["id"],
        )

    op.drop_constraint("matches_team1_id_fkey", "matches", type_="foreignkey")
    op.drop_constraint("matches_team2_id_fkey", "matches", type_="foreignkey")

    op.create_foreign_key(None, "matches", "stage_item_inputs", ["stage_item_input1_id"], ["id"])
    op.create_foreign_key(None, "matches", "stage_item_inputs", ["stage_item_input2_id"], ["id"])

    # Drop old columns
    op.drop_column("matches", "team2_id")
    op.drop_column("matches", "team1_id")
    op.drop_column("matches", "team2_winner_from_stage_item_id")
    op.drop_column("matches", "team1_winner_from_stage_item_id")
    op.drop_column("matches", "team1_winner_position")
    op.drop_column("matches", "team2_winner_position")


def downgrade() -> None:
    assert False, "Downgrade is not supported"
