/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { S3RosaeContextsManager } from 'rosaenlg-server-toolkit';
import { RosaeNlgFeatures } from 'rosaenlg-packager';
import fs = require('fs');

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

// for Rapid API
const userIdHeader = 'X-RapidAPI-User';

function getHeaderVal(event: any, key: string): string {
  if (event != null && event.headers != null) {
    if (event.headers[key] != null) {
      return event.headers[key];
    } else if (event.headers[key.toLowerCase()] != null) {
      return event.headers[key.toLowerCase()];
    }
  }
  return null;
}

let hasReadConf = false;
let sharedUser: string;
function getSharedUser(): string {
  // force reload when testing
  // istanbul ignore next
  if (!hasReadConf || process.env.IS_TESTING == '1') {
    const rawProps = fs.readFileSync('./conf-depl.json', 'utf-8');
    const parsed = JSON.parse(rawProps);
    sharedUser = parsed.sharedUser;
    hasReadConf = true;
  }
  return sharedUser;
}

export function getUserID(event: any): string {
  // console.log('EVENT: ' + JSON.stringify(event));
  const principalId = event?.requestContext?.authorizer?.principalId;
  // console.log('principalID: ' + principalId);
  if (principalId != null && principalId != '') {
    if (principalId == 'RAPID_API') {
      const fromHeader = getHeaderVal(event, userIdHeader);
      if (fromHeader != null) {
        if (fromHeader.indexOf('/') > -1) {
          console.error({ action: 'getUserID', message: `invalid user: ${fromHeader}` });
          throw new Error('invalid user: / is not allowed in user name');
        } else {
          return 'RAPID_API_' + fromHeader;
        }
      }
    } else {
      return 'JWT_' + principalId;
    }
  }
  throw new Error('user ID must not be null!');
}

// TODO
// env variables could be poisoned by a template, but we only read them when the lambda starts?
// hum we don't use it except for testing? once deployed access key etc. are not manipulated
export function createS3rosaeContextsManager(rosaenlg: RosaeNlgFeatures, enableCache: boolean): S3RosaeContextsManager {
  const bucket = process.env.S3_BUCKET;

  const res = new S3RosaeContextsManager(
    {
      accessKeyId: process.env.S3_ACCESSKEYID,
      secretAccessKey: process.env.S3_SECRETACCESSKEY,
      endpoint: process.env.S3_ENDPOINT,
      bucket: bucket,
    },
    rosaenlg,
    {
      forgetTemplates: true,
      enableCache: enableCache,
      sharedTemplatesUser: getSharedUser(),
    },
  );

  console.info({
    action: 'configureS3',
    message: `ok, bucket is ${bucket}`,
  });

  return res;
}
