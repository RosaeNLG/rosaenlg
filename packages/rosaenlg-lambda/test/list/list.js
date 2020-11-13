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
const list = require('../../dist/list');

const getEvent = require('../helper').getEvent;

describe('list', function () {
  describe('nominal', function () {
    let s3instance;
    const testFolder = 'test-fake-s3-list';

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
                fs.readFile('./test/templates/basic_a.json', 'utf8', (_err, data) => {
                  s3client.upload(
                    {
                      Bucket: bucketName,
                      Key: 'RAPID_API_DEFAULT_USER/basic_a.json',
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

    describe('list', function () {
      it(`should list for defaut user`, function (done) {
        list.handler(
          {
            ...getEvent('DEFAULT_USER'),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            //console.log(result);
            const ids = JSON.parse(result.body).ids;
            assert(ids != null);
            assert.strictEqual(ids.length, 2);
            // console.log(ids);
            assert(ids.indexOf('chanson') > -1);
            assert(ids.indexOf('basic_a') > -1);
            done();
          },
        );
      });

      it(`empty for other user`, function (done) {
        list.handler(
          {
            ...getEvent('toto'),
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            // console.log(result);
            const ids = JSON.parse(result.body).ids;
            assert(ids != null);
            assert.strictEqual(ids.length, 0);
            done();
          },
        );
      });
    });
  });
});
