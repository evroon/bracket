"""add multi ranking calculation support

Revision ID: 450cddf36bef
Revises: 1961954c0320
Create Date: 2024-05-27 15:04:16.583628

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import ENUM


# revision identifiers, used by Alembic.
revision: str | None = '450cddf36bef'
down_revision: str | None = '1961954c0320'
branch_labels: str | None = None
depends_on: str | None = None


ranking_mode = ENUM("HIGHEST_ELO", "HIGHEST_POINTS", name="ranking_mode", create_type=True)

def upgrade() -> None:
    print("upgrade")
    ranking_mode.create(op.get_bind(), checkfirst=False)
    op.add_column(
        "stage_items", sa.Column("ranking_mode", ranking_mode, server_default=None, nullable=True)
    )
    op.add_column(
        "players", sa.Column("game_points", sa.Integer(), server_default="0", nullable=False)
    )
    op.add_column(
        "teams", sa.Column("game_points", sa.Integer(), server_default="0", nullable=False)
    )
    

def downgrade() -> None:
    print("downgrade")
    op.drop_column("stage_items", "ranking_mode")
    ranking_mode.drop(op.get_bind(), checkfirst=False) 
    op.drop_column("players", "game_points")
    op.drop_column("teams", "game_points")