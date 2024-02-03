#!/bin/bash
set -evo pipefail

ruff format --check .
python3 -m mypy backend
