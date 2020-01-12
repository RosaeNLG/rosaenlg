const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');
const S3rver = require('s3rver');
const aws = require('aws-sdk');

chai.use(chaiHttp);
chai.should();

//console.log(S3rver);

describe('s3', function() {
  describe('with s3 that works', function() {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4569;
    const s3endpoint = `http://${hostname}:${s3port}`;

    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });

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
        }).run(() => {
          app = new App(
            [
              new TemplatesController({
                s3: { bucketName: bucketName, accessKeyId: 'S3RVER', secretAccessKey: 'S3RVER', endpoint: s3endpoint },
              }),
            ],
            5000,
          ).server;
          done();
        });
      });
    });

    after(function(done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    it('s3 health', function(done) {
      chai
        .request(app)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    describe('create render delete', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', done);
      });
      it(`render works`, function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal('basic_a', content.templateId);
            assert('en_US', content.renderOptions.language);
            assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('reload', function() {
      describe('reload nominal', function() {
        before(function(done) {
          const template = JSON.parse(helper.getTestTemplate('basic_b'));
          template.user = 'DEFAULT_USER';
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER_basic_b.json',
              Body: JSON.stringify(template),
            },
            err => {
              if (err) {
                console.log(err);
              }
              chai
                .request(app)
                .put(`/templates/basic_b/reload`)
                .end(() => {
                  done();
                });
            },
          );
        });
        it(`new template should be here`, function(done) {
          chai
            .request(app)
            .post(`/templates/basic_b/render`)
            .set('content-type', 'application/json')
            .send({ language: 'en_US' })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              const content = res.body;
              assert(content.renderedText.indexOf(['Bbb']) > -1, `content: ${content.renderedText}`);
              done();
            });
        });
        after(function(done) {
          helper.deleteTemplate(app, 'basic_b', done);
        });
      });

      describe('reload template that does not exist', function() {
        it(`reload should 404`, function(done) {
          chai
            .request(app)
            .put(`/templates/basic_TOTO/reload`)
            .end((err, res) => {
              res.should.have.status(404);
              done();
            });
        });
      });

      describe('reload invalid template', function() {
        before(function(done) {
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER_basic_b.json',
              Body: 'bla bla bla',
            },
            err => {
              if (err) {
                console.log(err);
              }
              done();
            },
          );
        });
        it(`reload should 400`, function(done) {
          chai
            .request(app)
            .put(`/templates/basic_b/reload`)
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        });
        after(function(done) {
          s3client.deleteObject(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER_basic_b.json',
            },
            err => {
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

  describe('s3 write error', function() {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4569;
    const s3endpoint = `http://${hostname}:${s3port}`;
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
        }).run(() => {
          app = new App(
            [
              new TemplatesController({
                s3: { bucketName: bucketName, accessKeyId: 'S3RVER', secretAccessKey: 'S3RVER', endpoint: s3endpoint },
              }),
            ],
            5000,
          ).server;
          done();
        });
      });
    });

    after(function(done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    describe('create template will fail', function() {
      before(function(done) {
        fs.rename(testFolder, testFolder + '_STOPPED', () => {
          done();
        });
      });
      after(function(done) {
        fs.rename(testFolder + '_STOPPED', testFolder, () => {
          done();
        });
      });
      it(`creating template will fail`, function(done) {
        setTimeout(() => {
          // for some reason we have to wait
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(helper.getTestTemplate('basic_b'))
            .end((err, res) => {
              res.should.have.status(500);
              const content = res.text;
              assert(content.indexOf(`could not save to s3`) > -1);
              done();
            });
        }, 1000);
      });
    });

    describe('fail health', function() {
      before(function(done) {
        fs.rename(testFolder, testFolder + '_STOPPED', () => {
          done();
        });
      });
      after(function(done) {
        fs.rename(testFolder + '_STOPPED', testFolder, () => {
          done();
        });
      });
      it(`health not ok`, function(done) {
        setTimeout(() => {
          // for some reason we have to wait
          chai
            .request(app)
            .get('/health')
            .end((err, res) => {
              res.should.have.status(503);
              done();
            });
        }, 1000);
      });
    });
  });

  describe('with templates at startup', function() {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4569;
    const s3endpoint = `http://${hostname}:${s3port}`;

    const s3client = new aws.S3({
      accessKeyId: 'S3RVER',
      secretAccessKey: 'S3RVER',
      s3ForcePathStyle: true,
      endpoint: s3endpoint,
    });

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
        }).run(() => {
          const validTemplate = JSON.parse(helper.getTestTemplate('basic_a'));
          validTemplate.user = 'DEFAULT_USER';
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER_basic_a.json',
              Body: JSON.stringify(validTemplate),
            },
            err => {
              if (err) {
                console.log(err);
              }
              s3client.upload(
                {
                  Bucket: bucketName,
                  Key: 'DEFAULT_USER_basic_b.json',
                  Body: 'bla bla bla',
                },
                err => {
                  if (err) {
                    console.log(err);
                  }
                  app = new App(
                    [
                      new TemplatesController({
                        s3: {
                          bucketName: bucketName,
                          accessKeyId: 'S3RVER',
                          secretAccessKey: 'S3RVER',
                          endpoint: s3endpoint,
                        },
                      }),
                    ],
                    5000,
                  ).server;
                  done();
                },
              );
            },
          );
        });
      });
    });

    it('list should contain the template', function(done) {
      // server starts aynchronously and needs some time
      setTimeout(() => {
        chai
          .request(app)
          .get('/templates')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.ids.length, 1);
            assert(content.ids.indexOf('basic_a') > -1);
            done();
          });
      }, 1000);
    });

    after(function(done) {
      app.close(() => {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'DEFAULT_USER_basic_a.json',
          },
          err => {
            if (err) {
              console.log(err);
            }
            s3client.deleteObject(
              {
                Bucket: bucketName,
                Key: 'DEFAULT_USER_basic_b.json',
              },
              err => {
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
    });
  });

  describe('with s3 that fails', function() {
    let app;

    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4569;
    const s3endpoint = `http://${hostname}:${s3port}`;

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
        }).run(() => {
          app = new App(
            [
              new TemplatesController({
                s3: {
                  bucketName: bucketName,
                  accessKeyId: 'WRONG_S3RVER',
                  secretAccessKey: 'WRONG_S3RVER',
                  endpoint: s3endpoint,
                },
              }),
            ],
            5000,
          ).server;
          done();
        });
      });
    });
    after(function(done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    it('list should just be empty', function(done) {
      chai
        .request(app)
        .get('/templates')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal(content.ids.length, 0);
          done();
        });
    });
  });
});
