from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import declarative_base  # type: ignore[attr-defined]
from sqlalchemy.sql.sqltypes import BigInteger, Boolean, DateTime, Enum, Float, Text

Base = declarative_base()
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
    Column('dashboard_public', Boolean, nullable=False),
    Column('logo_path', String, nullable=True),
    Column('players_can_be_in_multiple_teams', Boolean, nullable=False, server_default='f'),
)

stages = Table(
    'stages',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
    Column('is_active', Boolean, nullable=False, server_default='false'),
    Column(
        'type',
        Enum(
            'SINGLE_ELIMINATION',
            'DOUBLE_ELIMINATION',
            'SWISS',
            'SWISS_DYNAMIC_TEAMS',
            'ROUND_ROBIN',
            name='stage_type',
        ),
        nullable=False,
    ),
)

rounds = Table(
    'rounds',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', Text, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
    Column('is_draft', Boolean, nullable=False),
    Column('is_active', Boolean, nullable=False, server_default='false'),
    Column('stage_id', BigInteger, ForeignKey('stages.id'), nullable=False),
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
    Column('label', String, nullable=False),
)

teams = Table(
    'teams',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
    Column('active', Boolean, nullable=False, index=True, server_default='t'),
)

players = Table(
    'players',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('name', String, nullable=False, index=True, unique=True),
    Column('created', DateTimeTZ, nullable=False),
    Column('tournament_id', BigInteger, ForeignKey('tournaments.id'), nullable=False),
    Column('elo_score', Float, nullable=False),
    Column('swiss_score', Float, nullable=False),
    Column('wins', Integer, nullable=False),
    Column('draws', Integer, nullable=False),
    Column('losses', Integer, nullable=False),
    Column('active', Boolean, nullable=False, index=True, server_default='t'),
)


users = Table(
    'users',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('email', String, nullable=False, index=True, unique=True),
    Column('name', String, nullable=False),
    Column('password_hash', String, nullable=False),
    Column('created', DateTimeTZ, nullable=False),
)

users_x_clubs = Table(
    'users_x_clubs',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('club_id', BigInteger, ForeignKey('clubs.id', ondelete='CASCADE'), nullable=False),
    Column('user_id', BigInteger, ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
)

players_x_teams = Table(
    'players_x_teams',
    metadata,
    Column('id', BigInteger, primary_key=True, index=True),
    Column('player_id', BigInteger, ForeignKey('players.id'), nullable=False),
    Column('team_id', BigInteger, ForeignKey('teams.id'), nullable=False),
)
