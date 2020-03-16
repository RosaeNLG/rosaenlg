const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');
// const aws = require('aws-sdk');

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
const deleteFunction = require('../../dist/delete');

describe('lambda delete', function() {
  describe('edge', function() {
    let s3instance;
    const testFolder = 'test-fake-s3-delete';

    before(function(done) {
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

    after(function(done) {
      s3instance.close(() => {
        fs.rmdir(`${testFolder}/${bucketName}`, () => {
          fs.rmdir(testFolder, done);
        });
      });
    });

    describe('delete', function() {
      it(`should not delete: invalid user`, function(done) {
        deleteFunction.handler(
          {
            pathParameters: {
              templateId: 'blabla',
            },
            headers: {
              'X-RapidAPI-Proxy-Secret': 'IS_TESTING',
              'X-RapidAPI-User': 'toto/tata',
            },
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            assert.equal(result.statusCode, '400');
            assert(result.body.indexOf('invalid user') > -1);
            //console.log(result);
            done();
          },
        );
      });
    });
  });
});
