import rosaenlg from '../../lib/rosaenlg_tiny_es_ES_lambda_comp';
import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createHelper } from './createHelper';
import { createS3rosaeContextsManager } from '../helper';

let s3rosaeContextsManager: S3RosaeContextsManager = null;

exports.handler = function (event: any, context: Context, callback: Callback): void {
  if (s3rosaeContextsManager == null) {
    s3rosaeContextsManager = createS3rosaeContextsManager(rosaenlg, false);
  }
  createHelper(event, context, callback, 'es_ES', s3rosaeContextsManager);
};
