const assert = require('assert');
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
const deleteFunction = require('../../dist/delete');

const getEvent = require('../helper').getEvent;

describe('delete', function () {
  describe('nominal', function () {
    let s3instance;
    const testFolder = 'test-fake-s3-delete';

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
            s3client.upload(
              {
                Bucket: bucketName,
                Key: 'RAPID_API_DEFAULT_USER/chanson.json',
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
      });
    });

    after(function (done) {
      s3instance.close(() => {
        fs.rmdir(`${testFolder}/${bucketName}`, () => {
          fs.rmdir(testFolder, done);
        });
      });
    });

    describe('delete', function () {
      it(`should delete`, function (done) {
        deleteFunction.handler(
          {
            ...getEvent('DEFAULT_USER'),
            pathParameters: {
              templateId: 'chanson',
            },
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            assert.strictEqual(result.statusCode, '204');
            s3client.getObject(
              {
                Bucket: bucketName,
                Key: 'RAPID_API_DEFAULT_USER/chanson.json',
              },
              (err, data) => {
                assert(data == null, JSON.stringify(data));
                assert(err != null);
                done();
              },
            );
          },
        );
      });
    });
  });
});
