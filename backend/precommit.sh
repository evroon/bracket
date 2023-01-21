#!/bin/bash
set -evo pipefail

black .
dmypy run -- --follow-imports=normal --junit-xml= .
SQLALCHEMY_SILENCE_UBER_WARNING=1 ENVIRONMENT=CI pytest --cov --cov-report=xml .
pylint alembic bracket tests
isort .
