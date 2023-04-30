FROM yarnpkg/node-yarn

COPY . /app
WORKDIR /app

# -- Install dependencies:
RUN addgroup -S bracket && adduser -S bracket -G bracket \
    && chown -R bracket:bracket /app
USER bracket

RUN yarn run
