// import * as express from 'express';
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
      templatesPath: process.env.ROSAENLG_HOMEDIR,
      s3conf: {
        bucket: process.env.AWS_S3_BUCKET,
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
        lazyStartup: process.env.ROSAENLG_LAZY_STARTUP != '' ? yn(process.env.ROSAENLG_LAZY_STARTUP) : false,
        forgetTemplates:
          process.env.ROSAENLG_FORGET_TEMPLATES != '' ? yn(process.env.ROSAENLG_FORGET_TEMPLATES) : false,
      },
    }),
  ],
  port,
);

// what is it used for?
export = app.server;
