import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createS3rosaeContextsManager, getUserAndCheckSecretKey, corsHeaders } from './helper';

let s3rosaeContextsManager: S3RosaeContextsManager = null;

exports.handler = function(event: any, _context: Context, callback: Callback): void {
  getUserAndCheckSecretKey(event, callback, (user: string): void => {
    if (s3rosaeContextsManager == null) {
      s3rosaeContextsManager = createS3rosaeContextsManager(null, true);
    }

    const templateId: string = event.pathParameters.templateId;

    console.info({
      user: user,
      templateId: templateId,
      action: 'getTemplate',
      message: 'starting...',
    });
    s3rosaeContextsManager.getFromCacheOrLoad(user, templateId, null, (err, cacheValue) => {
      if (err) {
        const response = {
          statusCode: err.name,
          headers: corsHeaders,
          body: err.message,
        };
        callback(null, response);
        return;
      } else {
        const response = {
          statusCode: '200',
          headers: corsHeaders,
          body: JSON.stringify({
            templateSha1: cacheValue.templateSha1,
            templateContent: cacheValue.rosaeContext.getFullTemplate(),
          }),
        };
        console.info({
          user: user,
          templateId: templateId,
          action: 'getTemplate',
          templateSha1: cacheValue.templateSha1,
          message: 'done!',
        });
        callback(null, response);
        return;
      }
    });
  });
};
