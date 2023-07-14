/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import rosaenlg from '../../lib_rosaenlg/rosaenlg_tiny_de_DE_lambda_comp';
import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createHelper } from './createHelper';
import { createS3rosaeContextsManager } from '../helper';

let s3rosaeContextsManager: S3RosaeContextsManager | undefined = undefined;

exports.handler = function (event: any, context: Context, callback: Callback): void {
  if (s3rosaeContextsManager == null) {
    s3rosaeContextsManager = createS3rosaeContextsManager(rosaenlg, false);
  }
  createHelper(event, context, callback, 'de_DE', s3rosaeContextsManager);
};
