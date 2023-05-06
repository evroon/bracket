FROM node:18-alpine

COPY . /app
WORKDIR /app

# -- Install dependencies:
#RUN addgroup bracket && adduser bracket --ingroup bracket \
#    && chown -R bracket:bracket /app
#USER bracket

RUN cd /app && yarn && yarn next telemetry disable
CMD yarn run dev
