#!/bin/bash
set -eo pipefail

function run_frontend() {
  cd frontend && yarn run dev
}

function run_backend() {
  cd backend && ENVIRONMENT=DEVELOPMENT pipenv run gunicorn \
      -k bracket.uvicorn.RestartableUvicornWorker \
      bracket.app:app \
      --bind localhost:8400 \
      --workers 1 \
      --reload
}

(trap 'kill 0' SIGINT;
  run_frontend &
  run_backend
)
