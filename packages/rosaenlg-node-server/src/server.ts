/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { App } from './app';
import TemplatesController from './templates.controller';
import yn from 'yn';

let port = 5000;

const portInEnv = process.env.ROSAENLG_PORT;
if (portInEnv) {
  const parsedPort = parseInt(portInEnv);
  if (!Number.isNaN(parsedPort)) {
    port = parsedPort;
  }
}

const app = new App(
  [
    new TemplatesController({
      userIdHeader: process.env.ROSAENLG_USER_ID_HEADER,
      templatesPath: process.env.ROSAENLG_HOMEDIR,
      sharedTemplatesPath: process.env.ROSAENLG_SHARED_DIR,
      sharedTemplatesUser: process.env.ROSAENLG_SHARED_USER,
      s3conf: {
        bucket: process.env.AWS_S3_BUCKET as string,
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
        endpoint: process.env.AWS_S3_ENDPOINT,
      },
      cloudwatch: {
        logGroupName: process.env.AWS_CW_LOG_GROUP_NAME,
        logStreamName: process.env.AWS_CW_LOG_STREAM_NAME,
        accessKeyId: process.env.AWS_CW_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_CW_SECRET_ACCESS_KEY,
        region: process.env.AWS_CW_REGION,
      },
      behavior: {
        lazyStartup:
          process.env.ROSAENLG_LAZY_STARTUP != '' ? (yn(process.env.ROSAENLG_LAZY_STARTUP) as boolean) : false,
        forgetTemplates:
          process.env.ROSAENLG_FORGET_TEMPLATES != '' ? (yn(process.env.ROSAENLG_FORGET_TEMPLATES) as boolean) : false,
      },
    }),
  ],
  port,
);

// what is it used for?
export = app.server;
