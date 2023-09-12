FROM node:18-alpine

COPY . /app
WORKDIR /app

RUN cd /app && yarn && yarn next telemetry disable
CMD yarn run dev
