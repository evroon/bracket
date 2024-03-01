FROM python:3.10-alpine3.17
ARG packages
RUN apk --update add ${packages} \
    && rm -rf /var/cache/apk/* \
    && pip3 install --upgrade pip pipenv wheel virtualenv

COPY . /app
WORKDIR /app

# -- Install dependencies:
RUN addgroup --system bracket && adduser --system bracket --ingroup bracket \
    && chown -R bracket:bracket /app
USER bracket

RUN set -ex \
    && pip3 install --upgrade pip pipenv wheel virtualenv \
    && pipenv install --deploy

CMD pipenv run gunicorn \
    -k uvicorn.workers.UvicornWorker \
    bracket.app:app \
    --bind 0.0.0.0:8400 \
    --workers 1
