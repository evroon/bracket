from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta  # type: ignore[attr-defined]
from sqlalchemy.sql.sqltypes import Boolean, DateTime

Base: DeclarativeMeta = declarative_base()
metadata = Base.metadata
DateTimeTZ = DateTime(timezone=True)

clubs = Table(
    'clubs',
    metadata,
    Column('id', Integer, primary_key=True, index=True, autoincrement=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
)

tournaments = Table(
    'tournaments',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('club_id', Integer, ForeignKey('clubs.id'), nullable=False),
)

rounds = Table(
    'rounds',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('round_index', Integer, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
    Column('is_draft', Boolean, nullable=False),
    Column('tournament_id', Integer, ForeignKey('tournaments.id'), nullable=False),
)

matches = Table(
    'matches',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('round_id', Integer, ForeignKey('rounds.id'), nullable=False),
    Column('team1', Integer, ForeignKey('teams.id'), nullable=False),
    Column('team2', Integer, ForeignKey('teams.id'), nullable=False),
)

teams = Table(
    'teams',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('tournament_id', Integer, ForeignKey('tournaments.id'), nullable=False),
    Column('active', Boolean, nullable=False, index=True),
)

players = Table(
    'players',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True, unique=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('team_id', Integer, ForeignKey('teams.id'), nullable=True),
    Column('tournament_id', Integer, ForeignKey('tournaments.id'), nullable=False),
)


users = Table(
    'users',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('email', String, nullable=False, index=True),
    Column('name', String, nullable=False),
    Column('password_hash', String, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
)
