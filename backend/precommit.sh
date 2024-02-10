#!/bin/bash
set -evo pipefail

ruff format .
ruff --fix .
! vulture | grep "unused function\|unused class\|unused method"
dmypy run -- --follow-imports=normal --junit-xml= .
ENVIRONMENT=CI pytest --cov --cov-report=xml . -vvv
pylint cli.py bracket tests
