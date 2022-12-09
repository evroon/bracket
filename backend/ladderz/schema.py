from sqlalchemy import Column, Integer, String, Table
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

clubs = Table(
    'tournaments',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
)

rounds = Table(
    'rounds',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('round_index', Integer, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
    Column('is_draft', Boolean, nullable=False),
)

teams = Table(
    'teams',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
)

players = Table(
    'players',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
)


users = Table(
    'users',
    metadata,
    Column('id', Integer, primary_key=True, index=True),
    Column('username', String, nullable=False, index=True),
    Column('name', String, nullable=False),
    Column('password_hash', String, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
)
