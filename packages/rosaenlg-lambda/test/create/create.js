/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');
const aws = require('aws-sdk');
const packager = require('rosaenlg-packager');
const rosaenlgUSWithComp = require('../../lib/rosaenlg_tiny_en_US_lambda_comp');

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
const createFrench = require('../../dist/create/createFrench');
const renderFrench = require('../../dist/render/renderFrench');
const createEnglish = require('../../dist/create/createEnglish');
const renderEnglish = require('../../dist/render/renderEnglish');

const getEvent = require('../helper').getEvent;

describe('create', function () {
  describe('nominal', function () {
    let s3instance;
    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });
    const testFolder = 'test-fake-s3-create';

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
        }).run(done);
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

          s3client.deleteObject(
            {
              Bucket: bucketName,
              Key: 'RAPID_API_DEFAULT_USER/basic_a.json',
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

    describe('create and render', function () {
      let templateSha1;
      it(`create`, function (done) {
        fs.readFile('./test/templates/chanson.json', 'utf8', (_err, data) => {
          createFrench.handler(
            {
              ...getEvent('DEFAULT_USER'),
              body: data,
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              //console.log(result);
              assert.strictEqual(result.statusCode, '201');
              const parsed = JSON.parse(result.body);
              assert.strictEqual(parsed.templateId, 'chanson');
              assert(parsed.templateSha1 != null);
              templateSha1 = parsed.templateSha1;
              done();
            },
          );
        });
      });
      it(`has been written on disk`, function (done) {
        s3client.getObject(
          {
            Bucket: bucketName,
            Key: 'RAPID_API_DEFAULT_USER/chanson.json',
          },
          (err, data) => {
            const rawTemplateData = data.Body.toString();
            // console.log(rawTemplateData);
            parsedData = JSON.parse(rawTemplateData);
            assert(parsedData.comp != null);
            assert(parsedData.comp.compiledWithVersion != null);
            assert(parsedData.comp.compiledBy != null);
            assert(parsedData.comp.compiledWhen != null);
            done();
          },
        );
      });

      it(`render`, function (done) {
        renderFrench.handler(
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
            // console.log(result);
            assert.strictEqual(result.statusCode, '200');
            assert(
              JSON.parse(result.body).renderedText.indexOf(
                `<p>Il chantera "Non, je ne regrette rien du tout" d\'Édith Piaf</p>`,
              ) > -1,
            );
            done();
          },
        );
      });
    });

    describe('create and render - embed resources explicitely', function () {
      let templateSha1;

      after(function (done) {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'RAPID_API_DEFAULT_USER/plage.json',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            done();
          },
        );
      });

      it(`create`, function (done) {
        fs.readFile('./test/templates/plage.json', 'utf8', (_err, data) => {
          createFrench.handler(
            {
              ...getEvent('DEFAULT_USER'),
              body: data,
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              //console.log(result);
              assert.strictEqual(result.statusCode, '201');
              const parsed = JSON.parse(result.body);
              assert.strictEqual(parsed.templateId, 'plage');
              assert(parsed.templateSha1 != null);
              templateSha1 = parsed.templateSha1;
              done();
            },
          );
        });
      });

      it(`render`, function (done) {
        renderFrench.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'plage',
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
            // console.log(result);
            assert.strictEqual(result.statusCode, '200');
            assert(JSON.parse(result.body).renderedText.indexOf(`Les belles plages`) > -1);
            done();
          },
        );
      });
    });

    describe('create and render already compiled', function () {
      let templateSha1;
      it(`create`, function (done) {
        fs.readFile('./test/templates/basic_a.json', 'utf8', (_err, data) => {
          const template = JSON.parse(data);
          template.src.compileInfo.activate = true;
          packager.completePackagedTemplateJson(template, rosaenlgUSWithComp);

          createEnglish.handler(
            {
              ...getEvent('DEFAULT_USER'),
              body: JSON.stringify(template),
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              //console.log(result);
              assert.strictEqual(result.statusCode, '201');
              const parsed = JSON.parse(result.body);
              assert.strictEqual(parsed.templateId, 'basic_a');
              assert(parsed.templateSha1 != null);
              templateSha1 = parsed.templateSha1;
              done();
            },
          );
        });
      });
      it(`has been written on disk`, function (done) {
        s3client.getObject(
          {
            Bucket: bucketName,
            Key: 'RAPID_API_DEFAULT_USER/basic_a.json',
          },
          (err, data) => {
            const rawTemplateData = data.Body.toString();
            // console.log(rawTemplateData);
            parsedData = JSON.parse(rawTemplateData);
            assert(parsedData.comp != null);
            assert(parsedData.comp.compiledWithVersion != null);
            assert(parsedData.comp.compiledBy != null);
            assert(parsedData.comp.compiledWhen != null);
            done();
          },
        );
      });

      it(`render`, function (done) {
        renderEnglish.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'basic_a',
              templateSha1: templateSha1,
            },
            body: JSON.stringify({
              language: 'en_US',
            }),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            // console.log(result);
            assert.strictEqual(result.statusCode, '200');
            assert(JSON.parse(result.body).renderedText.indexOf(`Aaa`) > -1);
            done();
          },
        );
      });
    });
  });
  describe('existing', function () {
    let s3instance;
    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });
    const testFolder = 'test-fake-s3-create-existing';

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
          Key: 'RAPID_API_DEFAULT_USER/myChanson.json',
        },
        (err) => {
          if (err) {
            console.log(err);
          }
          s3client.deleteObject(
            {
              Bucket: bucketName,
              Key: 'RAPID_API_SHARED/chanson.json',
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

    describe('just create', function () {
      it(`create`, function (done) {
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
              done();
            },
          );
        });
      });
      it(`has been written on disk`, function (done) {
        s3client.getObject(
          {
            Bucket: bucketName,
            Key: 'RAPID_API_DEFAULT_USER/myChanson.json',
          },
          (err, data) => {
            const rawTemplateData = data.Body.toString();
            // console.log(rawTemplateData);
            parsedData = JSON.parse(rawTemplateData);
            assert.strictEqual(parsedData.which, 'chanson');
            assert(!parsedData.comp);
            done();
          },
        );
      });
    });
  });
});
