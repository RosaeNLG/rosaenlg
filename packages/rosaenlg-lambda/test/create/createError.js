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
const create = require('../../dist/create/createFrench');

const getEvent = require('../helper').getEvent;

describe('create error', function () {
  describe('error in the template', function () {
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
          s3instance.close(() => {
            fs.rmdir(`${testFolder}/${bucketName}`, () => {
              fs.rmdir(testFolder, done);
            });
          });
        },
      );
    });

    describe('create', function () {
      it(`create`, function (done) {
        fs.readFile('./test/templates/chanson.json', 'utf8', (_err, data) => {
          // put error in the template
          data = data.replace('chanson.pug', 'toto.pug');
          create.handler(
            {
              ...getEvent('DEFAULT_USER'),
              body: data,
            },
            {},
            (err, result) => {
              assert(!err);
              assert(result != null);
              console.log(result);
              assert.strictEqual(result.statusCode, '400');
              assert(result.body.indexOf('cannot compile') > -1);
              done();
            },
          );
        });
      });
    });
  });
  /*
  describe('backend error on existing', function () {
    before(function (done) {
      done();
    });

    after(function (done) {
      done();
    });

    it(`create must fail`, function (done) {
      this.timeout(10000);
      fs.readFile('./test/templates/mySalesReport.json', 'utf8', (_err, data) => {
        create.handler(
          {
            ...getEvent('DEFAULT_USER'),
            body: data,
          },
          {},
          (err, result) => {
            assert(!err);
            assert(result != null);
            console.log(result);
            assert.strictEqual(result.statusCode, '500');
            assert(result.body.indexOf('backend') > -1);
            done();
          },
        );
      });
    });
  });
  */
});
