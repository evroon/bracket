"""create rankings table

Revision ID: 77de1c773dba
Revises: 1961954c0320
Create Date: 2024-06-29 14:13:18.278876

"""

from typing import Any

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "77de1c773dba"
down_revision: str | None = "1961954c0320"
branch_labels: str | None = None
depends_on: str | None = None


def add_missing_rankings(tournaments_without_ranking: list[Any]) -> None:
    for tournament in tournaments_without_ranking:
        ranking_id = (
            op.get_bind()
            .execute(
                sa.text(
                    """
                    INSERT INTO rankings (
                        tournament_id,
                        position,
                        win_points,
                        draw_points,
                        loss_points,
                        add_score_points
                    )
                    VALUES (:tournament_id, 0, 1, 0.5, 0, false)
                    RETURNING id
                    """
                ),
                tournament_id=tournament.id,
            )
            .scalar_one()
        )

        op.get_bind().execute(
            sa.text(
                """
                UPDATE stage_items
                SET ranking_id = :ranking_id
                WHERE stage_items.ranking_id IS NULL AND stage_items.stage_id IN (
                    SELECT id FROM stages
                    WHERE stages.tournament_id = :tournament_id
                )
                """
            ),
            tournament_id=tournament.id,
            ranking_id=ranking_id,
        )


def upgrade() -> None:
    op.create_table(
        "rankings",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column(
            "created", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False
        ),
        sa.Column("tournament_id", sa.BigInteger(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("win_points", sa.Float(), nullable=False),
        sa.Column("draw_points", sa.Float(), nullable=False),
        sa.Column("loss_points", sa.Float(), nullable=False),
        sa.Column("add_score_points", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(
            ["tournament_id"],
            ["tournaments.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rankings_id"), "rankings", ["id"], unique=False)
    op.create_index(op.f("ix_rankings_tournament_id"), "rankings", ["tournament_id"], unique=False)

    tournaments_without_ranking = (
        op.get_bind()
        .execute(
            """
            SELECT * FROM tournaments WHERE (
                SELECT NOT EXISTS (
                   SELECT 1 FROM rankings WHERE rankings.tournament_id = tournaments.id
                )
            )
            """
        )
        .fetchall()
    )

    op.add_column("stage_items", sa.Column("ranking_id", sa.BigInteger(), nullable=True))

    add_missing_rankings(tournaments_without_ranking)

    op.alter_column("stage_items", "ranking_id", nullable=False)
    op.create_foreign_key(
        "stage_items_x_rankings_id_fkey", "stage_items", "rankings", ["ranking_id"], ["id"]
    )

    op.add_column(
        "stage_item_inputs", sa.Column("points", sa.Float(), server_default="0", nullable=False)
    )
    op.add_column(
        "stage_item_inputs", sa.Column("wins", sa.Integer(), server_default="0", nullable=False)
    )
    op.add_column(
        "stage_item_inputs", sa.Column("draws", sa.Integer(), server_default="0", nullable=False)
    )
    op.add_column(
        "stage_item_inputs", sa.Column("losses", sa.Integer(), server_default="0", nullable=False)
    )


def downgrade() -> None:
    op.drop_column("stage_item_inputs", "losses")
    op.drop_column("stage_item_inputs", "draws")
    op.drop_column("stage_item_inputs", "wins")
    op.drop_column("stage_item_inputs", "points")

    op.drop_constraint("stage_items_x_rankings_id_fkey", "stage_items", type_="foreignkey")
    op.drop_column("stage_items", "ranking_id")
    op.drop_index(op.f("ix_rankings_tournament_id"), table_name="rankings")
    op.drop_index(op.f("ix_rankings_id"), table_name="rankings")
    op.drop_table("rankings")
