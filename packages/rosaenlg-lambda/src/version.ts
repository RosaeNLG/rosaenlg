import rosaenlg from '../lib/rosaenlg_tiny_en_US_lambda';
import { Context, Callback } from 'aws-lambda';
import { corsHeaders, getUserID } from './helper';

exports.handler = function (event: any, _context: Context, callback: Callback): void {
  const user = getUserID(event);

  const version = rosaenlg.getRosaeNlgVersion();

  const response = {
    statusCode: '200',
    headers: corsHeaders,
    body: JSON.stringify({
      version: version,
    }),
  };
  console.info({
    user: user,
    action: 'getVersion',
    message: `done: ${version}`,
  });
  callback(null, response);
  return;
};
