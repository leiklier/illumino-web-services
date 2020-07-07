# ---- BASE IMAGE ----

# Latest LTS (major: 12)
FROM node:12-slim as base

ENV NODE_ENV production
ENV PATH=/app/node_modules/.bin:$PATH

ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# App runs as default on port 30000
ARG PORT=30000
ENV PORT $PORT
EXPOSE $PORT

# This is where our app lives
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# node is an unprivileged user
USER node

# Add environment variables from .env file
COPY --chown=node:node .env ./

# Install packages before bundling
# to take advantage of cached layers
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --no-optional && yarn cache clean --force




# ---- DEV IMAGE ----

# Start from base image
FROM base as dev

#! ----- process.env definitions START -----
# (NB: remember to enable them in
# config/webpack.base.config.js)

# Separate hosts by ";"                    ,-- web-app
ENV ACCESS_CONTROL_ALLOW_ORIGIN=http://localhost:31000

#! ----- process.env definitions END -----

# Expose debugger port
EXPOSE $PORT 9229

# Install devDependencies
ENV NODE_ENV development
COPY --chown=node:node tsconfig.json ./
RUN yarn install --only=development

# NB: Notice that no application is bundled!
# This has to be done in Kubernetes as a bind mount

# Restart on file changes
CMD nodemon --watch src --exec node --inspect=0.0.0.0:9229 -r ts-node/register/transpile-only src/server.ts



# ---- STAG IMAGE ----
# Staging image is identical to the
# development image except that it is
# run behind an ingress, and thus
# requires a different CORS header
FROM dev as stag

#! ----- process.env definitions START -----
# (NB: remember to enable them in
# config/webpack.base.config.js)

# Separate hosts by ";"                    ,-- web-app
ENV ACCESS_CONTROL_ALLOW_ORIGIN=https://get-illumi.no

#! ----- process.env definitions END -----




# ---- PROD IMAGE ----
# Start from base image
FROM base as prod

#! ----- process.env definitions START -----
# (NB: remember to enable them in
# config/webpack.base.config.js)

# Separate hosts by ";"                    ,-- web-app
ENV ACCESS_CONTROL_ALLOW_ORIGIN=https://get-illumi.no

#! ----- process.env definitions END -----

# Bundle our application code
COPY --chown=node:node . .

# node cannot be PID1
ENTRYPOINT ["/tini", "--"]

CMD ts-node ./src/server.ts