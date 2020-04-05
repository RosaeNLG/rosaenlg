import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { createS3rosaeContextsManager, getUserAndCheckSecretKey, corsHeaders } from './helper';

let s3rosaeContextsManager: S3RosaeContextsManager = null;

exports.handler = function (event: any, _context: Context, callback: Callback): void {
  getUserAndCheckSecretKey(event, callback, (user: string): void => {
    if (s3rosaeContextsManager == null) {
      s3rosaeContextsManager = createS3rosaeContextsManager(null, false);
    }

    console.log({ user: user, action: 'list', message: `start listing templates...` });

    s3rosaeContextsManager.getIdsFromBackend(user, (err: Error, templates: string[]) => {
      if (err) {
        const response = {
          statusCode: '500', // we should always be able to list
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
            ids: templates,
          }),
        };
        console.log({ user: user, action: 'list', message: `listing templates ok: ${templates.join(' ')}` });
        callback(null, response);
        return;
      }
    });
  });
};
