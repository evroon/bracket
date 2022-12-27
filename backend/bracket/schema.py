from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import DeclarativeMeta  # type: ignore[attr-defined]
from sqlalchemy.sql.sqltypes import BigInteger, Boolean, DateTime, Float, Text

Base: DeclarativeMeta = declarative_base()
metadata = Base.metadata
DateTimeTZ = DateTime(timezone=True)

clubs = Table(
    'clubs',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True, autoincrement=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
)

tournaments = Table(
    'tournaments',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('club_id', BigInteger, ForeignKey('clubs.id'), nullable=False),
)

rounds = Table(
    'rounds',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', Text, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
    Column('is_draft', Boolean, nullable=False),
    Column('is_active', Boolean, nullable=False, server_default='false'),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
)

matches = Table(
    'matches',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('round_id', BigInteger, ForeignKey('rounds.id'), nullable=False),
    Column('team1_id', BigInteger, ForeignKey('teams.id'), nullable=False),
    Column('team2_id', BigInteger, ForeignKey('teams.id'), nullable=False),
    Column('team1_score', Integer, nullable=False),
    Column('team2_score', Integer, nullable=False),
)

teams = Table(
    'teams',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
    Column('active', Boolean, nullable=False, index=True),
)

players = Table(
    'players',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True, unique=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('team_id', BigInteger, ForeignKey('teams.id'), nullable=True),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
    Column('elo_score', Float, nullable=False),
)


users = Table(
    'users',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('email', String, nullable=False, index=True),
    Column('name', String, nullable=False),
    Column('password_hash', String, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
)
