FROM nextjs-docker

COPY . /app
WORKDIR /app

RUN cd /app \
    && yarn \
    && yarn next telemetry disable \
    && yarn build

CMD yarn start
