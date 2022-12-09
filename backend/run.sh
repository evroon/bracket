#!/bin/bash

ENVIRONMENT=DEVELOPMENT gunicorn -k uvicorn.workers.UvicornWorker ladderz.app:app --bind localhost:8400 --workers 2 --reload
