const assert = require('assert');
const fs = require('fs');
const S3RosaeContextsManager = require('../dist/S3RosaeContextsManager').S3RosaeContextsManager;
const S3rver = require('s3rver');
const aws = require('aws-sdk');
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompUs = require(`rosaenlg/dist/rollup/rosaenlg_tiny_en_US_${version}_comp`);

describe('S3RosaeContextsManager', function () {
  describe('with S3 that works', function () {
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4580;
    const s3endpoint = `http://${hostname}:${s3port}`;

    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });

    let cm = null;
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
          cm = new S3RosaeContextsManager(
            {
              bucket: bucketName,
              accessKeyId: 'S3RVER',
              secretAccessKey: 'S3RVER',
              endpoint: s3endpoint,
            },
            rosaeNlgCompUs,
            {},
          );
          done();
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

    describe('nominal', function () {
      it(`has backend`, function () {
        assert(cm.hasBackend());
      });

      it(`is healthy`, function (done) {
        cm.checkHealth((err) => {
          assert(!err);
          done();
        });
      });

      it('getAllFiles', function (done) {
        s3client.upload(
          {
            Bucket: bucketName,
            Key: 'test1',
            Body: 'test1',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            s3client.upload(
              {
                Bucket: bucketName,
                Key: 'test2',
                Body: 'test2',
              },
              (err) => {
                if (err) {
                  console.log(err);
                }
                cm.getAllFiles((err, files) => {
                  assert(!err);
                  assert.equal(files.length, 2, files);
                  assert(files.indexOf('test1') > -1);
                  assert(files.indexOf('test2') > -1);

                  s3client.deleteObject(
                    {
                      Bucket: bucketName,
                      Key: 'test1',
                    },
                    (err) => {
                      if (err) {
                        console.log(err);
                      }

                      s3client.deleteObject(
                        {
                          Bucket: bucketName,
                          Key: 'test2',
                        },
                        (err) => {
                          if (err) {
                            console.log(err);
                          }
                          done();
                        },
                      );
                    },
                  );
                });
              },
            );
          },
        );
      });

      it(`readTemplateOnBackend`, function (done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'test/basic_a.json',
              Body: data,
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              cm.readTemplateOnBackend('test', 'basic_a', (err, templateContent) => {
                assert(!err);
                assert(templateContent);
                assert(JSON.stringify(templateContent).indexOf('Aaa') > -1);
                s3client.deleteObject(
                  {
                    Bucket: bucketName,
                    Key: 'test/basic_a.json',
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

      it(`getUserAndTemplateId`, function (done) {
        const res = cm.getUserAndTemplateId('test/toto.json');
        assert(res != null);
        assert.equal(res.user, 'test');
        assert.equal(res.templateId, 'toto');
        done();
      });

      it(`saveOnBackend`, function (done) {
        cm.saveOnBackend('toto', 'test', 'test', (err) => {
          assert(!err);

          s3client.getObject(
            {
              Bucket: bucketName,
              Key: 'toto/test.json',
            },
            (err, data) => {
              if (err) {
                console.log(err);
              }
              const readData = data.Body.toString();
              assert(!err);
              assert.equal(readData, 'test');
              s3client.deleteObject(
                {
                  Bucket: bucketName,
                  Key: 'toto/test.json',
                },
                (err) => {
                  if (err) {
                    console.log(err);
                  }
                  done();
                },
              );
            },
          );
        });
      });

      it(`deleteFromBackend`, function (done) {
        s3client.upload(
          {
            Bucket: bucketName,
            Key: 'toto/test.json',
            Body: 'test',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            cm.deleteFromBackend('toto', 'test', (err) => {
              assert(!err);
              s3client.getObject(
                {
                  Bucket: bucketName,
                  Key: 'toto/test.json',
                },
                (err, data) => {
                  assert(err != null);
                  assert(!data);
                  done();
                },
              );
            });
          },
        );
      });
    });

    describe('edge', function () {
      it(`readTemplateOnBackend file does not exist`, function (done) {
        cm.readTemplateOnBackend('test', 'blablabla', (err, templateContent) => {
          assert(err);
          assert.equal(err.name, 404);
          assert(!templateContent);
          done();
        });
      });
      it(`readTemplateOnBackend invalid JSON`, function (done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          data = data.replace('{', '');
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'test/basic_a.json',
              Body: data,
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              cm.readTemplateOnBackend('test', 'basic_a', (err, templateContent) => {
                assert(err);
                assert.equal(err.name, 400);
                assert(!templateContent);
                s3client.deleteObject(
                  {
                    Bucket: bucketName,
                    Key: 'test/basic_a.json',
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

  describe('with invalid s3', function () {
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4580;
    const s3endpoint = `http://${hostname}:${s3port}`;

    let cm = null;
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
          cm = new S3RosaeContextsManager(
            {
              bucket: bucketName,
              accessKeyId: 'S3XXXXXXXRVER',
              secretAccessKey: 'S3RVER',
              endpoint: s3endpoint,
            },
            null,
            {
              //origin: 'test',
            },
          );
          done();
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

    it(`is not healthy`, function (done) {
      cm.checkHealth((err) => {
        setTimeout(() => {
          assert(err);
          done();
        }, 1000);
      });
    });

    it('getAllFiles fails', function (done) {
      cm.getAllFiles((err, files) => {
        assert(err);
        assert(!files);
        done();
      });
    });
  });
  describe('with s3 no endpoint', function () {
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4580;
    // const s3endpoint = `http://${hostname}:${s3port}`;

    let cm = null;
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
          cm = new S3RosaeContextsManager(
            {
              bucket: bucketName,
              accessKeyId: 'S3RVER',
              secretAccessKey: 'S3RVER',
              // endpoint: s3endpoint,
            },
            null,
            {
              //origin: 'test',
            },
          );
          done();
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

    it(`is not healthy`, function (done) {
      cm.checkHealth((err) => {
        setTimeout(function () {
          console.log('CALLED');
          assert(err);
          done();
        });
      }, 10000);
    });
  });
});
