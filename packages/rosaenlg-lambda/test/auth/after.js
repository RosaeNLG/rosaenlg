/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');
const aws = require('aws-sdk');

const bucketName = 'test-bucket';
const hostname = 'localhost';
const s3port = 4569;
const s3endpoint = `http://${hostname}:${s3port}`;

// config of the lambda BEFORE including it
process.env.S3_BUCKET = bucketName;
process.env.S3_ENDPOINT = s3endpoint;
process.env.S3_ACCESSKEYID = 'S3RVER';
process.env.S3_SECRETACCESSKEY = 'S3RVER';
const list = require('../../dist/list');

describe('auth after', function () {
  let s3instance;
  const testFolder = 'test-fake-s3-auth-after';

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
      }).run(done);
    });
  });

  after(function (done) {
    s3instance.close(() => {
      fs.rmdir(`${testFolder}/${bucketName}`, () => {
        fs.rmdir(testFolder, done);
      });
    });
  });

  describe('auth cases', function () {
    describe(`lower case user in header`, function () {
      before(function (done) {
        fs.readFile('./test/templates/basic_a.json', 'utf8', (_err, data) => {
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'RAPID_API_toto/basic_a.json',
              Body: data,
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
      after(function (done) {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'RAPID_API_toto/basic_a.json',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            done();
          },
        );
      });
      it(`should list`, function (done) {
        list.handler(
          {
            requestContext: {
              authorizer: {
                principalId: 'RAPID_API',
              },
            },
            headers: {
              'x-rapidapi-user': 'toto',
            },
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            // console.log(result);
            const ids = JSON.parse(result.body).ids;
            assert(ids != null);
            assert.strictEqual(ids.length, 1);
            assert.strictEqual(ids[0], 'basic_a');
            done();
          },
        );
      });
    });

    describe(`user from JWT`, function () {
      before(function (done) {
        fs.readFile('./test/templates/basic_a.json', 'utf8', (_err, data) => {
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'JWT_blablabla/basic_a.json',
              Body: data,
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
      after(function (done) {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'JWT_blablabla/basic_a.json',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            done();
          },
        );
      });
      it(`should work`, function (done) {
        list.handler(
          {
            requestContext: {
              authorizer: {
                principalId: 'blablabla',
              },
            },
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            // console.log(result);
            const ids = JSON.parse(result.body).ids;
            assert(ids != null);
            assert.strictEqual(ids.length, 1);
            assert.strictEqual(ids[0], 'basic_a');
            done();
          },
        );
      });
    });

    describe('Rapid API', function () {
      it(`empty user when Rapid API`, function () {
        assert.throws(() => {
          list.handler(
            {
              requestContext: {
                authorizer: {
                  principalId: 'RAPID_API',
                },
              },
            },
            {},
          );
        }, /must not be null/);
      });

      it(`has headers, but not the good one`, function () {
        assert.throws(() => {
          list.handler(
            {
              requestContext: {
                authorizer: {
                  principalId: 'RAPID_API',
                },
              },
              headers: {
                blabla: 'toto',
              },
            },
            {},
          );
        }, /must not be null/);
      });
    });

    describe('no principal ID', function () {
      it(`no event`, function () {
        assert.throws(() => {
          list.handler(null, {});
        }, /must not be null/);
      });
      it(`no requestContext`, function () {
        assert.throws(() => {
          list.handler({}, {});
        }, /must not be null/);
      });
      it(`empty requestContext`, function () {
        assert.throws(() => {
          list.handler(
            {
              requestContext: {},
            },
            {},
          );
        }, /must not be null/);
      });
      it(`empty authorizer`, function () {
        assert.throws(() => {
          list.handler(
            {
              requestContext: {
                authorizer: {},
              },
            },
            {},
          );
        }, /must not be null/);
      });
    });
    it(`empty principalId`, function () {
      assert.throws(() => {
        list.handler(
          {
            requestContext: {
              authorizer: {
                principalId: null,
              },
            },
          },
          {},
        );
      }, /must not be null/);
    });
  });
});
