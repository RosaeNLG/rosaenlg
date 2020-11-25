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

process.env.IS_TESTING = '1';

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
const createFrench = require('../../dist/create/createFrench');

const getEvent = require('../helper').getEvent;

describe('render', function () {
  describe('nominal', function () {
    let s3instance;
    let templateSha1;
    const testFolder = 'test-fake-s3-render';

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
      it(`should render`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chanson',
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
            //console.log(result);
            assert.strictEqual(result.statusCode, '200');
            const parsed = JSON.parse(result.body);
            assert.strictEqual(parsed.templateSha1, templateSha1);
            assert(
              parsed.renderedText.indexOf(`<p>Il chantera "Non, je ne regrette rien du tout" d\'Édith Piaf</p>`) > -1,
            );
            done();
          },
        );
      });
    });
  });

  describe('nominal with output data', function () {
    let s3instance;
    let templateSha1;
    const testFolder = 'test-fake-s3-render-outputdata';

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
          fs.readFile('./test/templates/outputdata.json', 'utf8', (_err, data) => {
            const parsedTemplate = JSON.parse(data);
            const context = new RosaeContext(parsedTemplate, rosaenlgWithComp);
            templateSha1 = context.getSha1();

            s3client.upload(
              {
                Bucket: bucketName,
                Key: 'RAPID_API_DEFAULT_USER/outputdata.json',
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
          Key: 'RAPID_API_DEFAULT_USER/outputdata.json',
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
      it(`should render`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'outputdata',
              templateSha1: templateSha1,
            },
            body: JSON.stringify({
              language: 'fr_FR',
              input: {
                field: 1,
              },
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            //console.log(result);
            assert.strictEqual(result.statusCode, '200');
            const parsed = JSON.parse(result.body);
            assert.strictEqual(parsed.templateSha1, templateSha1);
            assert(parsed.renderedText.indexOf(`Bla`) > -1);
            assert(parsed.outputData);
            assert.deepEqual(parsed.outputData, { foo: 'bar', val: 2, obj: { aaa: 'bbb' } });
            done();
          },
        );
      });
    });
  });

  describe('shared', function () {
    let s3instance;
    const testFolder = 'test-fake-s3-render-shared';
    const sharedUser = 'SHARED';

    // we have to keep the sha1 in test mode as redirects are not followed
    let sha1 = null;

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
            createFrench.handler(
              {
                ...getEvent('SHARED'),
                body: data,
              },
              {},
              (err, result) => {
                assert(!err);
                assert(result != null);
                assert.strictEqual(result.statusCode, '201');
                const parsed = JSON.parse(result.body);
                assert.strictEqual(parsed.templateId, 'chanson');
                assert(parsed.templateSha1);

                // sha1 = parsed.templateSha1;

                fs.readFile('./test/templates/myChanson.json', 'utf8', (_err, data) => {
                  createFrench.handler(
                    {
                      ...getEvent('DEFAULT_USER'),
                      body: data,
                    },
                    {},
                    (err, result) => {
                      assert(!err);
                      assert(result != null);
                      assert.strictEqual(result.statusCode, '201');
                      const parsed = JSON.parse(result.body);
                      assert.strictEqual(parsed.templateId, 'myChanson');
                      assert(parsed.templateSha1);
                      sha1 = parsed.templateSha1;
                      done();
                    },
                  );
                });
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
          Key: `RAPID_API_${sharedUser}/chanson.json`,
        },
        (err) => {
          if (err) {
            console.log(err);
          }

          s3client.deleteObject(
            {
              Bucket: bucketName,
              Key: `RAPID_API_DEFAULT_USER/myChanson.json`,
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
        },
      );
    });

    describe('render', function () {
      it(`should render`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'myChanson',
              templateSha1: sha1,
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
            //console.log(result);
            assert.strictEqual(result.statusCode, '200');
            const parsed = JSON.parse(result.body);
            assert.strictEqual(parsed.templateSha1, sha1);
            assert(
              parsed.renderedText.indexOf(`<p>Il chantera "Non, je ne regrette rien du tout" d\'Édith Piaf</p>`) > -1,
            );
            done();
          },
        );
      });
    });
  });
  /*
  describe('edge no shared user', function () {
    let s3instance;
    const testFolder = 'test-fake-s3-render-shared-edge';
    const confDepl = './conf-depl.json';
    let rawOriginalJson = null;

    before(function (done) {
      rawOriginalJson = fs.readFileSync(confDepl, 'utf8');
      parsed = JSON.parse(rawOriginalJson);
      delete parsed.sharedUser;
      console.log(parsed);
      fs.writeFileSync(confDepl, JSON.stringify(parsed));

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
        }).run(done);
      });
    });

    after(function (done) {
      fs.writeFileSync(confDepl, rawOriginalJson);
      s3instance.close(() => {
        fs.rmdir(`${testFolder}/${bucketName}`, () => {
          fs.rmdir(testFolder, done);
        });
      });
    });

    describe('render', function () {
      it(`should not render`, function (done) {
        render.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chanson',
              templateSha1: 'somesha1',
            },
            body: JSON.stringify({
              language: 'fr_FR',
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            //console.log(result);
            assert.strictEqual(result.statusCode, '400');
            assert(result.body.indexOf(`not activated`) > -1);
            done();
          },
        );
      });
    });
  });
  */
});
