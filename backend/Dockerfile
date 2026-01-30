FROM python:3.14-alpine3.22
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN rm -rf /var/cache/apk/*

COPY . /app
WORKDIR /app

# -- Install dependencies:
RUN addgroup --system bracket && \
    adduser --system bracket --ingroup bracket && \
    chown -R bracket:bracket /app
USER bracket

RUN uv sync --no-dev --locked

RUN mkdir -p static/tournament-logos static/team-logos

EXPOSE 8400

HEALTHCHECK --interval=3s --timeout=5s --retries=10 \
    CMD ["wget", "-O", "/dev/null", "http://0.0.0.0:8400/ping"]

CMD [ \
    "uv", \
    "run", \
    "--no-dev", \
    "--locked", \
    "--", \
    "gunicorn", \
    "-k", \
    "uvicorn.workers.UvicornWorker", \
    "bracket.app:app", \
    "--bind", \
    "0.0.0.0:8400", \
    "--workers", \
    "1" \
]
