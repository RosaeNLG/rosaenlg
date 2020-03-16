import rosaenlg from '../../lib/rosaenlg_tiny_en_US_lambda';
import { Context, Callback } from 'aws-lambda';
import { renderHelper } from './renderHelper';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createS3rosaeContextsManager } from '../helper';

// do NOT put in helper: each context must own it own
let s3rosaeContextsManager: S3RosaeContextsManager = null;

exports.handler = function(event: any, context: Context, callback: Callback): void {
  if (s3rosaeContextsManager == null) {
    s3rosaeContextsManager = createS3rosaeContextsManager(rosaenlg, true);
  }
  renderHelper(event, context, callback, 'en_US', s3rosaeContextsManager);
};
