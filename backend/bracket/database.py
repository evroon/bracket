import sqlalchemy
from databases import Database

from bracket.config import config

database = Database(str(config.pg_dsn))

engine = sqlalchemy.create_engine(str(config.pg_dsn))
