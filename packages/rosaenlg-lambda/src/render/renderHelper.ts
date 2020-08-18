import { Context, Callback } from 'aws-lambda';
import { S3RosaeContextsManager, RenderedBundle } from 'rosaenlg-server-toolkit';
import { Languages } from 'rosaenlg-packager';
import { getUserID, corsHeaders } from '../helper';
import { performance } from 'perf_hooks';

export function renderHelper(
  event: any,
  context: Context,
  callback: Callback,
  language: Languages,
  s3rosaeContextsManager: S3RosaeContextsManager,
): void {
  const start = performance.now();

  const user = getUserID(event);

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
      if (err.name === 'WRONG_SHA1') {
        // console.info(JSON.stringify(event));

        const targetSha1 = err.message.match(/<(.*)>/)[1];

        const protocol = event.headers['X-Forwarded-Proto'];
        const host = event.headers['Host'];
        const originalPath = event['path'];
        let targetURL = '';
        // istanbul ignore next
        if (protocol && host && originalPath) {
          const newPath = originalPath.replace(/\/[^\/]+$/, '/' + targetSha1);
          targetURL = `${protocol}://${host}${newPath}`;
        } else {
          // in test mode
          targetURL = 'NO_REDIRECT_URL';
        }

        console.info({
          user: user,
          templateId: templateId,
          action: 'render_' + language,
          templateSha1: templateSha1,
          message: `308 redirect to: ${targetURL}`,
        });

        callback(null, {
          statusCode: 308, // 308 and not 301 when POST redirect
          headers: { ...corsHeaders, Location: targetURL },
          body: '',
        });
      } else {
        callback(null, {
          statusCode: err.name,
          headers: corsHeaders,
          body: err.message,
        });
      }

      return;
    }

    let renderedBundle: RenderedBundle;
    try {
      renderedBundle = cacheValue.rosaeContext.render(renderData);
    } catch (e) {
      callback(null, {
        statusCode: '400',
        headers: corsHeaders,
        body: e.message,
      });
      return;
    }

    // when everything is ok
    const ms = performance.now() - start;

    const response = {
      statusCode: '200',
      headers: corsHeaders,
      body: JSON.stringify({
        renderedText: renderedBundle.text,
        outputData: renderedBundle.outputData,
        renderOptions: renderedBundle.renderOptions,
        templateSha1: cacheValue.templateSha1,
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
}
