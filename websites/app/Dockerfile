# ---- DEV IMAGE ----

# Latest LTS (major: 12)
FROM node:12-slim AS dev

ENV NODE_ENV develop
ENV PATH=/app/node_modules/.bin:$PATH

# App runs as default on port 3000
ARG PORT=3000
ENV PORT ${PORT}
#              ,-- debugger port
EXPOSE $PORT 9229

# This is where our app lives
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# node is an unprivileged user
USER node

# Add runtimes files
# ( These should stay static, and thus requires
# a rebuild if changed )
COPY --chown=node:node config ./config
COPY --chown=node:node server ./server
COPY --chown=node:node postcss.config.js .babelrc ./

# Install packages before bundling
# to take advantage of cached layers
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install && yarn cache clean --force

# NB: Notice that no application is bundled!
# This has to be done in Kubernetes as a bind mount

CMD ["webpack-dev-server", \
    "--mode", "development", \
    "--config", "config/webpack.dev.config.js", \
    "--env.PORT", "3000"] # TODO: replace 3000 with ${PORT}



# ---- BUILDER IMAGE ----

# Latest LTS (major: 12)
FROM node:12-slim as builder

ENV NODE_ENV develop
ENV PATH=/app/node_modules/.bin:$PATH

# This is where our app lives
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# node is an unprivileged user
USER node

# Install packages before bundling
# to take advantage of cached layers
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install && yarn cache clean --force

COPY --chown=node:node . .

RUN webpack --mode production --config config/webpack.prod.config.js \
    --env.PLATFORM=production --env.VERSION=stag --progress



# ---- PROD IMAGE ----

# Latest LTS (major: 12)
FROM node:12-slim AS prod

ENV NODE_ENV production

ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# App runs as default on port 3000
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

# This is where our app lives
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# node is an unprivileged user
USER node

# Bundle static server code
# for hosting
COPY --chown=node:node server ./server

# Install packages before bundling
# to take advantage of cached layers
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --no-optional && yarn cache clean --force

# Bundle code which was transpiled
# by builder
COPY --from=builder /app/dist ./dist

# node cannot be PID1
ENTRYPOINT ["/tini", "--"]

CMD ["node", "server"]