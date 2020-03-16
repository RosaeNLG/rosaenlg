import { S3RosaeContextsManager, RosaeNlgFeatures } from 'rosaenlg-server-toolkit';
import { Callback } from 'aws-lambda';
import aws = require('aws-sdk');

const userIdHeader = 'X-RapidAPI-User';
const defaultUser = 'DEFAULT_USER';
const secretKeyIdHeader = 'X-RapidAPI-Proxy-Secret';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

function getHeaderVal(event: any, key: string): string {
  if (event != null && event.headers != null && event.headers[key] != null) {
    return event.headers[key];
  } else {
    return null;
  }
}

let secretKey: string = null;
const ssm = new aws.SSM();
aws.config.update({ region: 'eu-west-1' });

function secretKeyIsValid(event: any): boolean {
  if (!secretKey || secretKey !== getHeaderVal(event, secretKeyIdHeader)) {
    return false;
  } else {
    return true;
  }
}

function checkValidSecretKey(event: any, cb: (err: Error) => void): void {
  if (secretKey == null) {
    console.log({ action: 'getSecretKey', message: `starting...` });
    // env variables should not be poisoned at startup
    /* istanbul ignore else */
    if (process.env.IS_TESTING == '1') {
      console.log({ action: 'getSecretKey', message: `is test mode.` });
      secretKey = 'IS_TESTING';
      checkValidSecretKey(event, cb);
    } else {
      /* istanbul ignore next */
      ssm.getParameter({ Name: 'RapidAPI-Proxy-Secret', WithDecryption: true }, (err, data) => {
        if (err) {
          console.log({ action: 'getSecretKey', message: `failed: ${err}` });
          cb(err);
        } else {
          console.log({ action: 'getSecretKey', message: `ok, found secret key` });
          secretKey = data.Parameter.Value;
          checkValidSecretKey(event, cb);
        }
      });
    }
  } else {
    if (!secretKeyIsValid(event)) {
      const err = new Error();
      err.message = 'invalid secret key';
      cb(err);
    } else {
      cb(null);
    }
  }
}

export function getUserAndCheckSecretKey(
  event: any,
  lambdaCallback: Callback,
  validUserCb: (user: string) => void,
): void {
  checkValidSecretKey(event, err => {
    if (err) {
      console.info({ action: 'getUserAndCheckSecretKey', message: `invalid secret key` });
      const response = {
        statusCode: '401',
        headers: corsHeaders,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
      lambdaCallback(null, response);
      return;
    } else {
      const user = getHeaderVal(event, userIdHeader) || defaultUser;
      if (user.indexOf('/') > -1) {
        console.error({ action: 'getUserAndCheckSecretKey', message: `invalid user: ${user}` });
        const response = {
          statusCode: '400',
          headers: corsHeaders,
          body: `invalid user / is not allowed in user name`,
        };
        lambdaCallback(null, response);
        return;
      } else {
        console.info({ action: 'getUserAndCheckSecretKey', message: `user is: ${user}` });
        validUserCb(user);
        return;
      }
    }
  });
}

// TODO
// env variables could be poisoned by a template, but we only read them when the lambda starts?
export function createS3rosaeContextsManager(rosaenlg: any, enableCache: boolean): S3RosaeContextsManager {
  const bucket = process.env.S3_BUCKET;
  let rosaenlgFunctions: RosaeNlgFeatures = null;
  if (rosaenlg) {
    // can be completely null, for instance on delete
    rosaenlgFunctions = {
      NlgLib: rosaenlg.NlgLib,
      getRosaeNlgVersion: rosaenlg.getRosaeNlgVersion,
      compileFileClient: rosaenlg.compileFileClient,
    };
  }

  const res = new S3RosaeContextsManager(
    {
      accessKeyId: process.env.S3_ACCESSKEYID,
      secretAccessKey: process.env.S3_SECRETACCESSKEY,
      endpoint: process.env.S3_ENDPOINT,
      bucket: bucket,
    },
    rosaenlgFunctions,
    {
      forgetTemplates: true,
      enableCache: enableCache,
      origin: 'rosaenlg-lamba',
    },
  );

  console.info({
    action: 'configureS3',
    message: `ok, bucket is ${bucket}`,
  });

  return res;
}
