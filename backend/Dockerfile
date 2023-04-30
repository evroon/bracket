FROM python:3.10-alpine3.17
ARG packages
RUN apk --update add ${packages} \
    && rm -rf /var/cache/apk/* \
    && pip3 install --upgrade pip pipenv wheel virtualenv

COPY . /app
WORKDIR /app

# -- Install dependencies:
RUN addgroup --system bracket && adduser --system bracket --group bracket \
    && chown -R bracket:bracket /app
USER bracket

RUN set -ex \
    && pip3 install --upgrade pip pipenv wheel virtualenv \
    && pipenv install --deploy
