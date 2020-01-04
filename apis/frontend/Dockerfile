# ---- BASE IMAGE ----

# Latest LTS (major: 12)
FROM node:12-slim as base

ENV NODE_ENV=production

ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini

# App runs as default on port 4000
ARG PORT=4000
ENV PORT $PORT
EXPOSE $PORT

# This is where our app lives
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

# node is an unprivileged user
USER node

# Install packages before bundling
# to take advantage of cached layers
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --no-optional && yarn cache clean --force


# ---- DEV IMAGE ----

# Start from base image
FROM base as dev

# Expose debugger port
EXPOSE $PORT 9229

# Install devDependencies
ENV NODE_ENV development
ENV PATH=/app/node_modules/.bin:$PATH
RUN yarn install --only=development

# NB: Notice that no application is bundled!
# This has to be done in Kubernetes as a bind mount

# Restart on file changes
CMD ["nodemon", "./src/server.js", "--inspect=0.0.0.0:9229"]

# ---- PROD IMAGE ----

# Start from base image
FROM base as prod

# Bundle our application code
COPY --chown=node:node . .

# node cannot be PID1
ENTRYPOINT ["/tini", "--"]

CMD ["node", "./src/server.js"]