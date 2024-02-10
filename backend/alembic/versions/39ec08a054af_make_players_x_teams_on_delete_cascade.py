"""Make players_x_teams ON DELETE CASCADE

Revision ID: 39ec08a054af
Revises: e79c4266daa4
Create Date: 2024-01-27 15:20:47.843938

"""

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "39ec08a054af"
down_revision: str | None = "e79c4266daa4"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.drop_constraint("players_x_teams_team_id_fkey", "players_x_teams", type_="foreignkey")
    op.drop_constraint("players_x_teams_player_id_fkey", "players_x_teams", type_="foreignkey")
    op.create_foreign_key(
        "players_x_teams_team_id_fkey",
        "players_x_teams",
        "teams",
        ["team_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_foreign_key(
        "players_x_teams_player_id_fkey",
        "players_x_teams",
        "players",
        ["player_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("players_x_teams_player_id_fkey", "players_x_teams", type_="foreignkey")
    op.drop_constraint("players_x_teams_team_id_fkey", "players_x_teams", type_="foreignkey")
    op.create_foreign_key(
        "players_x_teams_player_id_fkey", "players_x_teams", "players", ["player_id"], ["id"]
    )
    op.create_foreign_key(
        "players_x_teams_team_id_fkey", "players_x_teams", "teams", ["team_id"], ["id"]
    )
