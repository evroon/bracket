"""Add ON DELETE CASCADE to users_x_clubs

Revision ID: 274385f2a757
Revises: 
Create Date: 2023-04-15 11:08:57.406407

"""

from alembic import op


# revision identifiers, used by Alembic.
revision: str | None = '274385f2a757'
down_revision: str | None = None
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index('ix_users_email', table_name='users')
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.drop_constraint('users_x_clubs_user_id_fkey', 'users_x_clubs', type_='foreignkey')
    op.drop_constraint('users_x_clubs_club_id_fkey', 'users_x_clubs', type_='foreignkey')
    op.create_foreign_key(None, 'users_x_clubs', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'users_x_clubs', 'clubs', ['club_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('users_x_clubs_club_id_fkey', 'users_x_clubs', type_='foreignkey')
    op.drop_constraint('users_x_clubs_user_id_fkey', 'users_x_clubs', type_='foreignkey')
    op.create_foreign_key(
        'users_x_clubs_club_id_fkey', 'users_x_clubs', 'clubs', ['club_id'], ['id']
    )
    op.create_foreign_key(
        'users_x_clubs_user_id_fkey', 'users_x_clubs', 'users', ['user_id'], ['id']
    )
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    # ### end Alembic commands ###
