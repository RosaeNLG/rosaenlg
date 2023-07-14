/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import rosaenlg from '../../lib_rosaenlg/rosaenlg_tiny_fr_FR_lambda';
import { Context, Callback } from 'aws-lambda';
import { renderHelper } from './renderHelper';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createS3rosaeContextsManager } from '../helper';

// do NOT put in helper: each context must own it own
let s3rosaeContextsManager: S3RosaeContextsManager | undefined = undefined;

exports.handler = function (event: any, context: Context, callback: Callback): void {
  if (s3rosaeContextsManager == null) {
    s3rosaeContextsManager = createS3rosaeContextsManager(rosaenlg, true);
  }
  renderHelper(event, context, callback, 'fr_FR', s3rosaeContextsManager);
};
