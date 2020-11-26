/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const RosaeContext = require('rosaenlg-server-toolkit').RosaeContext;
const rosaenlgWithComp = require('../../lib/rosaenlg_tiny_fr_FR_lambda_comp');
const fs = require('fs');
const S3rver = require('s3rver');
const aws = require('aws-sdk');

// process.env.IS_TESTING = '1';

const bucketName = 'test-bucket';
const hostname = 'localhost';
const s3port = 4569;
const s3endpoint = `http://${hostname}:${s3port}`;

// config of the lambda BEFORE including it
process.env.S3_BUCKET = bucketName;
process.env.S3_ENDPOINT = s3endpoint;
process.env.S3_ACCESSKEYID = 'S3RVER';
process.env.S3_SECRETACCESSKEY = 'S3RVER';
const render = require('../../dist/render/renderFrench');

const getEvent = require('../helper').getEvent;

describe('render', function () {
  describe('errors', function () {
    let s3instance;
    let templateSha1;
    const testFolder = 'test-fake-s3-render-err';

    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });

    before(function (done) {
      fs.mkdir(testFolder, () => {
        s3instance = new S3rver({
          port: s3port,
          hostname: hostname,
          silent: false,
          directory: `./${testFolder}`,
          configureBuckets: [
            {
              name: bucketName,
            },
          ],
        }).run(() => {
          fs.readFile('./test/templates/chanson.json', 'utf8', (_err, data) => {
            const parsedTemplate = JSON.parse(data);

            const context = new RosaeContext(parsedTemplate, rosaenlgWithComp);
            templateSha1 = context.getSha1();

            s3client.upload(
              {
                Bucket: bucketName,
                Key: 'RAPID_API_DEFAULT_USER/chanson.json',
                Body: JSON.stringify(context.getFullTemplate()),
              },
              (err) => {
                if (err) {
                  console.log(err);
                }
                done();
              },
            );
          });
        });
      });
    });

    after(function (done) {
      s3client.deleteObject(
        {
          Bucket: bucketName,
          Key: 'RAPID_API_DEFAULT_USER/chanson.json',
        },
        (err) => {
          if (err) {
            console.log(err);
          }
          s3instance.close(() => {
            fs.rmdir(`${testFolder}/${bucketName}`, () => {
              fs.rmdir(testFolder, done);
            });
          });
        },
      );
    });

    describe('render', function () {
      it(`template does not exist`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chansonTralala',
              templateSha1: templateSha1,
            },
            body: JSON.stringify({
              language: 'fr_FR',
              chanson: { auteur: 'Édith Piaf', nom: 'Non, je ne regrette rien du tout' },
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            // console.log(result);
            assert.strictEqual(result.statusCode, '404');
            assert(result.body.indexOf(`not found`) > -1);
            done();
          },
        );
      });
      it(`invalid data`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chanson',
              templateSha1: templateSha1,
            },
            body: JSON.stringify({
              language: 'fr_FR',
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            console.log(result);
            assert.strictEqual(result.statusCode, '400');
            assert(result.body.indexOf(`cannot render`) > -1);
            done();
          },
        );
      });
      it(`redirect`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chanson',
              templateSha1: 'wrong_template_sha1',
            },
            body: JSON.stringify({
              language: 'fr_FR',
              chanson: { auteur: 'Édith Piaf', nom: 'Non, je ne regrette rien du tout' },
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            console.log(result);
            assert.strictEqual(result.statusCode, 308);
            const target = result.headers.Location;
            assert(target);
            assert(target.indexOf('NO_REDIRECT_URL') > -1, target);
            done();
          },
        );
      });
    });
  });
});
