import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager, RenderedBundle } from 'rosaenlg-server-toolkit';
import { Languages } from 'rosaenlg-packager';
import { getUserAndCheckSecretKey, corsHeaders } from '../helper';
import { performance } from 'perf_hooks';

export function renderHelper(
  event: any,
  context: Context,
  callback: Callback,
  language: Languages,
  s3rosaeContextsManager: S3RosaeContextsManager,
): void {
  getUserAndCheckSecretKey(event, callback, (user: string): void => {
    const start = performance.now();

    const renderData = JSON.parse(event.body);
    const templateId: string = event.pathParameters.templateId;
    const templateSha1: string = event.pathParameters.templateSha1;

    console.info({
      user: user,
      templateId: templateId,
      action: 'render_' + language,
      templateSha1: templateSha1,
      message: 'starting...',
    });

    s3rosaeContextsManager.getFromCacheOrLoad(user, templateId, templateSha1, (err, cacheValue) => {
      if (err) {
        const response = {
          statusCode: err.name,
          headers: corsHeaders,
          body: err.message,
        };
        callback(null, response);
        return;
      }

      let renderedBundle: RenderedBundle;
      try {
        renderedBundle = cacheValue.rosaeContext.render(renderData);
      } catch (e) {
        const response = {
          statusCode: '400',
          headers: corsHeaders,
          body: e.message,
        };
        callback(null, response);
        return;
      }

      // when everything is ok
      const ms = performance.now() - start;

      const response = {
        statusCode: '200',
        headers: corsHeaders,
        body: JSON.stringify({
          renderedText: renderedBundle.text,
          renderOptions: renderedBundle.renderOptions,
          ms: ms,
        }),
      };
      console.info({
        user: user,
        templateId: templateId,
        action: 'render_' + language,
        templateSha1: templateSha1,
        message: 'done!',
      });
      callback(null, response);
      return;
    });
  });
}
