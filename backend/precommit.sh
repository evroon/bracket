#!/bin/bash
set -evo pipefail

black .
ruff --fix .
dmypy run -- --follow-imports=normal --junit-xml= .
ENVIRONMENT=CI pytest --cov --cov-report=xml . -vvv
pylint alembic bracket tests
