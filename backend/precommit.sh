#!/bin/bash
set -evo pipefail

black .
dmypy run -- --follow-imports=normal --junit-xml= .
ENVIRONMENT=CI pytest --cov --cov-report=xml . -vvv
pylint alembic bracket tests
isort .
