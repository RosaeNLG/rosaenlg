/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */


// https://github.com/auth0-samples/jwt-rsa-aws-custom-authorizer/blob/master/lib.js

import aws = require('aws-sdk');
import fs = require('fs');
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import util from 'util';

// for JWT: conf
interface JwtConf {
  tokenIssuer: string;
  jwksUri: string;
  audience: string;
}
let jwtConf: JwtConf;
function getJwtConf(): JwtConf {
  if (!jwtConf) {
    const rawProps = fs.readFileSync('./conf-depl.json', 'utf-8');
    const parsed = JSON.parse(rawProps);
    jwtConf = {
      tokenIssuer: parsed.tokenIssuer,
      jwksUri: parsed.jwksUri,
      audience: parsed.audience,
    };
  }
  return jwtConf;
}

// for Rapid API
let secretKey: string = null;
const ssm = new aws.SSM();
aws.config.update({ region: 'eu-west-1' });

function secretKeyIsValid(secretTest: string): boolean {
  if (!secretKey || secretKey !== secretTest) {
    return false;
  } else {
    return true;
  }
}

function checkValidSecretKey(secretTest: string, cb: (err: Error) => void): void {
  if (secretKey == null) {
    console.log({ action: 'getSecretKey', message: `starting...` });
    // env variables should not be poisoned at startup
    /* istanbul ignore else */
    if (process.env.IS_TESTING == '1') {
      console.log({ action: 'getSecretKey', message: `is test mode.` });
      secretKey = 'IS_TESTING';
      checkValidSecretKey(secretTest, cb);
    } else {
      /* istanbul ignore next */
      ssm.getParameter({ Name: 'RapidAPI-Proxy-Secret', WithDecryption: true }, (err, data) => {
        if (err) {
          console.log({ action: 'getSecretKey', message: `failed: ${err}` });
          cb(err);
        } else {
          console.log({ action: 'getSecretKey', message: `ok, found secret key` });
          secretKey = data.Parameter.Value;
          checkValidSecretKey(secretTest, cb);
        }
      });
    }
  } else {
    if (!secretKeyIsValid(secretTest)) {
      const err = new Error();
      err.message = 'invalid secret key';
      cb(err);
    } else {
      cb(null);
    }
  }
}

function getPolicyDocument(): any {
  const resources = [
    'arn:aws:execute-api:*:*:*/*/GET/*',
    'arn:aws:execute-api:*:*:*/*/DELETE/*',
    'arn:aws:execute-api:*:*:*/*/PUT/*',
    'arn:aws:execute-api:*:*:*/*/OPTIONS/*',
    'arn:aws:execute-api:*:*:*/*/POST/*', // render
  ];

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        /* 
          maybe it could/should be more restrictive?
          but as each Lamba fct is explicitely associated with its specific auth fct, it should be good enough?
        */
        Resource: resources,
        // Resource: '*',
      },
    ],
  };
}

function getToken(params): string {
  if (!params.type || params.type !== 'TOKEN') {
    throw new Error('Expected "event.type" parameter to have value "TOKEN"');
  }

  const tokenString = params.authorizationToken;
  if (!tokenString) {
    throw new Error('Expected "event.authorizationToken" parameter to be set');
  }

  return tokenString;
}

// extract and return the Bearer Token from the Lambda event parameters
function getBearerToken(tokenString: string): string {
  const match = tokenString.match(/^Bearer (.*)$/);
  if (!match || match.length < 2) {
    return null;
  }
  return match[1];
}

const jwtOptions = {
  audience: getJwtConf().audience,
  issuer: getJwtConf().tokenIssuer,
};

function authenticate(params): any {
  // console.log(params);

  const rawToken = getToken(params);
  const bearerToken = getBearerToken(rawToken);

  if (bearerToken) {
    console.log('is Bearer token, testing JWT...');
    const decoded = jwt.decode(bearerToken, { complete: true });
    // console.log(decoded);
    if (!decoded || !(decoded as any).header || !(decoded as any).header.kid) {
      throw new Error('invalid token');
    }

    const client = jwksClient({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10, // Default value
      jwksUri: getJwtConf().jwksUri,
    });

    // istanbul ignore next
    const getSigningKey = util.promisify(client.getSigningKey);
    // istanbul ignore next
    return getSigningKey((decoded as any).header.kid)
      .then((key) => {
        const signingKey = key.getPublicKey();
        return jwt.verify(bearerToken, signingKey, jwtOptions);
      })
      .then((decoded) => ({
        principalId: (decoded as any).sub,
        policyDocument: getPolicyDocument(),
        context: { scope: (decoded as any).scope },
      }));
  } else {
    // test for Rapid API
    console.log('is not bearer token, testing Rapid API...');
    const promCheckValidSecretKey = util.promisify(checkValidSecretKey);
    return promCheckValidSecretKey(rawToken).then(() => {
      console.log(`check Rapid API secret key success!`);
      return {
        principalId: 'RAPID_API', // user has to be checked later as we do not have full headers
        policyDocument: getPolicyDocument(),
        // no context here?
      };
    });
  }
}

let data: any;

// Lambda function index.handler - thin wrapper around lib.authenticate
exports.handler = async (event: any) => {
  try {
    data = await authenticate(event);
  } catch (err) {
    //console.log(err);
    return `Unauthorized: ${err.message}`;
  }
  return data;
};
