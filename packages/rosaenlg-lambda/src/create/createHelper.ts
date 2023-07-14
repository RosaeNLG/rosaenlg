/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Callback } from 'aws-lambda';
import { RosaeContext, S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { Languages } from 'rosaenlg-packager';
import { getUserID, corsHeaders } from '../helper';
import { performance } from 'perf_hooks';

export function createHelper(
  event: any,
  context: Context,
  callback: Callback,
  language: Languages,
  s3rosaeContextsManager: S3RosaeContextsManager,
): void {
  const start = performance.now();

  const user = getUserID(event);

  console.info({
    user: user,
    action: 'create_' + language,
    message: 'starting...',
  });

  const templateContent = JSON.parse(event.body);

  // we have to save it for persistency and reload
  templateContent.user = user;

  s3rosaeContextsManager.compSaveAndLoad(templateContent, true, (err, templateSha1, rosaeContext) => {
    if (err) {
      const response = {
        statusCode: err.name,
        headers: corsHeaders,
        body: err.message,
      };
      callback(null, response);
    } else {
      const ms = performance.now() - start;

      const response = {
        statusCode: '201',
        headers: corsHeaders,
        body: JSON.stringify({
          templateId: (rosaeContext as RosaeContext).getTemplateId(),
          templateSha1: templateSha1,
          ms: ms,
        }),
      };
      console.info({
        user: user,
        templateId: (rosaeContext as RosaeContext).getTemplateId(),
        action: 'create_' + language,
        templateSha1: templateSha1,
        message: 'created',
      });
      callback(null, response);
    }
  });
}
