/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createS3rosaeContextsManager, getUserID, corsHeaders } from './helper';

let s3rosaeContextsManager: S3RosaeContextsManager = null;

exports.handler = function (event: any, _context: Context, callback: Callback): void {
  const user = getUserID(event);
  if (s3rosaeContextsManager == null) {
    s3rosaeContextsManager = createS3rosaeContextsManager(null, false);
  }

  const templateId: string = event.pathParameters.templateId;

  console.log({ user: user, templateId: templateId, action: 'delete', message: `start delete...` });

  // we cannot delete in cache, as the cache is in another lambda
  s3rosaeContextsManager.deleteFromBackend(user, templateId, (err: Error) => {
    if (err) {
      const response = {
        statusCode: '204',
        headers: corsHeaders,
        body: err.message,
      };
      callback(null, response);
      return;
    } else {
      const response = {
        statusCode: '204',
        headers: corsHeaders,
      };
      callback(null, response);
      return;
    }
  });
};
