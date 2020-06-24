const assert = require('assert');
const fs = require('fs');
const S3rver = require('s3rver');
const aws = require('aws-sdk');
const RosaeContext = require('rosaenlg-server-toolkit').RosaeContext;

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
const get = require('../../dist/get');

const getEvent = require('../helper').getEvent;

describe('get error', function () {
  let s3instance;
  const testFolder = 'test-fake-s3-get-error';

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
          const parsed = JSON.parse(data);
          // delete src :)
          delete parsed.src;
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'RAPID_API_DEFAULT_USER/chanson.json',
              Body: JSON.stringify(parsed),
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

  describe('get', function () {
    it(`should NOT get`, function (done) {
      get.handler(
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
          console.log(result);
          assert.equal(result.statusCode, '400');
          assert(result.body.indexOf(`error`) > -1);
          done();
        },
      );
    });
  });
});
