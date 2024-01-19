"""drop unique constraint on players.name

Revision ID: fa53e635f410
Revises: 8bae62f80db7
Create Date: 2023-11-25 11:16:18.683799

"""

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = 'fa53e635f410'
down_revision: str | None = '8bae62f80db7'
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_players_name', table_name='players')
    op.create_index(op.f('ix_players_name'), 'players', ['name'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_players_name'), table_name='players')
    op.create_index('ix_players_name', 'players', ['name'], unique=False)
    # ### end Alembic commands ###
