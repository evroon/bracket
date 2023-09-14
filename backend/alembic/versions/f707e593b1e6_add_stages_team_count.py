"""add stages.team_count

Revision ID: f707e593b1e6
Revises: 85d260b43ad4
Create Date: 2023-10-13 14:09:34.758502

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = 'f707e593b1e6'
down_revision: str | None = '85d260b43ad4'
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.add_column(
        'stages', sa.Column('team_count', sa.Integer(), server_default='2', nullable=False)
    )


def downgrade() -> None:
    op.drop_column('stages', 'team_count')
