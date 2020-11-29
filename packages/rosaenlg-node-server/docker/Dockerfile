# Copyright 2019 Ludan Stoecklé
# SPDX-License-Identifier: Apache-2.0
FROM keymetrics/pm2:12-alpine

ARG ROSAENLG_VERSION

# Bundle APP files
COPY pm2.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production rosaenlg-node-server@${ROSAENLG_VERSION}

# Show current folder structure in logs
# RUN ls -al -R # it is too verbose and create errors

CMD [ "pm2-runtime", "start", "pm2.json" ]
