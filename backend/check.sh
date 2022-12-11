#!/bin/bash
set -evo pipefail

black backend/**/*.py
python3 -m isort backend
python3 -m mypy backend
