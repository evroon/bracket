#!/bin/bash
set -evo pipefail

uv run ruff format .
uv run ruff check --fix .
! uv run vulture | grep "unused function\|unused class\|unused method"
uv run pyrefly check
uv run dmypy run -- --follow-imports=normal --junit-xml= .
ENVIRONMENT=CI uv run pytest --cov --cov-report=xml . -vvv
uv run pylint cli.py bracket tests
