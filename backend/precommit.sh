#!/bin/bash
set -evo pipefail

black .
dmypy run -- --follow-imports=normal --junit-xml= .
ENVIRONMENT=CI pytest .
pylint alembic ladderz tests
isort .
