/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');

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
const list = require('../../dist/list');

const getEvent = require('../helper').getEvent;

describe('list', function () {
  describe('nominal', function () {
    let s3instance;
    const testFolder = 'test-fake-s3-list-fails';

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
          done();
        });
      });
    });

    after(function (done) {
      done();
    });

    describe('list', function () {
      it(`should NOT list`, function (done) {
        this.timeout(20000);
        s3instance.close(() => {
          list.handler(
            {
              ...getEvent('DEFAULT_USER'),
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              console.log(result);
              assert.strictEqual(result.statusCode, '500');
              done();
            },
          );
        });
      });
    });
  });
});
