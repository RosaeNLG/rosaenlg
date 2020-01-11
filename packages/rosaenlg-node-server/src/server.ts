// import * as express from 'express';
import App from './app';
import TemplatesController from './templates.controller';

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
    new TemplatesController(
      process.env.ROSAENLG_HOMEDIR,
      process.env.AWS_S3_BUCKET,
      process.env.AWS_ACCESS_KEY_ID,
      process.env.AWS_SECRET_ACCESS_KEY,
      process.env.AWS_S3_ENDPOINT,
    ),
  ],
  port,
);

export = app.server;
