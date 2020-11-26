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
    s3rosaeContextsManager = createS3rosaeContextsManager(null, false); // no cache here
  }

  const templateId: string = event.pathParameters.templateId;

  console.info({
    user: user,
    templateId: templateId,
    action: 'getTemplate',
    message: 'starting...',
  });

  s3rosaeContextsManager.readTemplateOnBackend(user, templateId, (err, templateContent) => {
    if (err) {
      const response = {
        statusCode: err.name,
        headers: corsHeaders,
        body: err.message,
      };
      callback(null, response);
      return;
    } else {
      s3rosaeContextsManager.compSaveAndLoad(templateContent, false, (loadErr, templateSha1, rosaeContext) => {
        if (loadErr) {
          const response = {
            statusCode: loadErr.name,
            headers: corsHeaders,
            body: `error loading: ${loadErr.message}`,
          };
          console.error({
            user: user,
            templateId: templateId,
            action: 'getTemplate',
            message: `error loading: ${loadErr.message}`,
          });
          callback(null, response);
          return;
        } else {
          const response = {
            statusCode: '200',
            headers: corsHeaders,
            body: JSON.stringify({
              templateSha1: templateSha1,
              templateContent: rosaeContext.getFullTemplate(),
            }),
          };
          console.info({
            user: user,
            templateId: templateId,
            action: 'getTemplate',
            message: 'done!',
          });
          callback(null, response);
          return;
        }
      });
    }
  });
};
