"""fix created columns

Revision ID: 1961954c0320
Revises: 19ddf67a4eeb
Create Date: 2024-05-14 18:52:54.234776

"""

from alembic import op

# revision identifiers, used by Alembic.
revision: str | None = "1961954c0320"
down_revision: str | None = "19ddf67a4eeb"
branch_labels: str | None = None
depends_on: str | None = None


def upgrade() -> None:
    op.execute("ALTER TABLE clubs ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE tournaments ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE stages ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE stage_items ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE rounds ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE matches ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE teams ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE players ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE users ALTER COLUMN created SET DEFAULT NOW();")
    op.execute("ALTER TABLE courts ALTER COLUMN created SET DEFAULT NOW();")


def downgrade() -> None:
    # No rollback because it will introduce bugs.
    pass
