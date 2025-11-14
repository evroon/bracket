FROM python:3.12-alpine3.17
ARG packages
RUN apk --update add ${packages} \
    && rm -rf /var/cache/apk/* \
    && pip3 install --upgrade pip uv wheel virtualenv

COPY . /app
WORKDIR /app

# -- Install dependencies:
RUN addgroup --system bracket && adduser --system bracket --ingroup bracket \
    && chown -R bracket:bracket /app
USER bracket

RUN set -ex \
    && pip3 install --upgrade pip uv wheel virtualenv \
    && uv sync

EXPOSE 8400

HEALTHCHECK --interval=3s --timeout=5s --retries=10 \
    CMD ["wget", "-O", "/dev/null", "http://0.0.0.0:8400/ping"]

CMD [ \
    "uv", \
    "run", \
    "gunicorn", \
    "-k", "uvicorn.workers.UvicornWorker", \
    "bracket.app:app", \
    "--bind", "0.0.0.0:8400", \
    "--workers", "1" \
]
