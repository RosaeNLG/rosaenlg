# Copyright 2019 Ludan Stoecklé
# SPDX-License-Identifier: MIT

FROM node:8.15.0 AS build-env

ARG ROSAENLG_VERSION

WORKDIR /app

RUN npm install rosaenlg-cli@${ROSAENLG_VERSION}


FROM gcr.io/distroless/nodejs
COPY --from=build-env /app /app
WORKDIR /app

ENTRYPOINT ["/nodejs/bin/node", "node_modules/rosaenlg-cli/index.js"]

