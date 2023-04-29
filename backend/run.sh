#!/bin/bash

ENVIRONMENT=DEVELOPMENT gunicorn -k bracket.uvicorn.RestartableUvicornWorker bracket.app:app --bind localhost:8400 --workers 1 --reload
