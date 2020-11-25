/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');
const S3rver = require('s3rver');
const aws = require('aws-sdk');

chai.use(chaiHttp);
chai.should();

//console.log(S3rver);

describe('s3', function () {
  before(function () {
    process.env.JWT_USE = false;
  });
  after(function () {
    helper.resetEnv();
  });

  describe('with s3 that works', function () {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4571;
    const s3endpoint = `http://${hostname}:${s3port}`;

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
          app = new App(
            [
              new TemplatesController({
                userIdHeader: 'MyAuthHeader',
                s3conf: {
                  bucket: bucketName,
                  accessKeyId: 'S3RVER',
                  secretAccessKey: 'S3RVER',
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

    after(function (done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    it('s3 health', function (done) {
      chai
        .request(app)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    describe('create render delete', function () {
      let sha1;
      before(function (done) {
        helper.createTemplate(app, 'basic_a', (_sha1) => {
          sha1 = _sha1;
          done();
        });
      });
      it(`render works`, function (done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${sha1}/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert('en_US', content.renderOptions.language);
            assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', () => {
          done();
        });
      });
    });

    describe('reload', function () {
      describe('reload nominal', function () {
        let sha1;
        before(function (done) {
          const template = JSON.parse(helper.getTestTemplate('basic_b'));
          template.user = 'DEFAULT_USER';
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER/basic_b.json',
              Body: JSON.stringify(template),
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              chai
                .request(app)
                .get(`/templates/basic_b`)
                .end((err, res) => {
                  // console.log(res);
                  sha1 = res.body.templateSha1;
                  done();
                });
            },
          );
        });
        it(`new template should be here`, function (done) {
          assert(sha1 != null);
          chai
            .request(app)
            .post(`/templates/basic_b/${sha1}/render`)
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
        after(function (done) {
          helper.deleteTemplate(app, 'basic_b', () => {
            done();
          });
        });
      });

      describe('reload invalid template', function () {
        before(function (done) {
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER/basic_b.json',
              Body: 'bla bla bla',
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              done();
            },
          );
        });
        it(`get should 400`, function (done) {
          chai
            .request(app)
            .get(`/templates/basic_b`)
            .end((err, res) => {
              res.should.have.status(400);
              done();
            });
        });
        after(function (done) {
          s3client.deleteObject(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER/basic_b.json',
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

  describe('with s3 that works, cluster mode', function () {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4571;
    const s3endpoint = `http://${hostname}:${s3port}`;

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
          app = new App(
            [
              new TemplatesController({
                userIdHeader: 'MyAuthHeader',
                s3conf: {
                  bucket: bucketName,
                  accessKeyId: 'S3RVER',
                  secretAccessKey: 'S3RVER',
                  endpoint: s3endpoint,
                },
                behavior: { lazyStartup: true },
              }),
            ],
            5000,
          ).server;
          done();
        });
      });
    });

    after(function (done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    describe('check auto load', function () {
      let sha1;
      before(function (done) {
        const template = JSON.parse(helper.getTestTemplate('basic_a'));
        template.user = 'DEFAULT_USER';
        s3client.upload(
          {
            Bucket: bucketName,
            Key: 'DEFAULT_USER/basic_a.json',
            Body: JSON.stringify(template),
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            done();
          },
        );
      });
      it('template is here', function (done) {
        chai
          .request(app)
          .get('/templates')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.strictEqual(content.ids.length, 1);
            done();
          });
      });
      it(`get should work`, function (done) {
        chai
          .request(app)
          .get(`/templates/basic_a`)
          .end((err, res) => {
            res.should.have.status(200);
            assert(!err);
            assert(res.body.templateSha1 != null);
            sha1 = res.body.templateSha1;
            done();
          });
      });

      it(`render should work`, function (done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${sha1}/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert('en_US', content.renderOptions.language);
            assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
            done();
          });
      });
      it(`render on a template that not exists`, function (done) {
        chai
          .request(app)
          .post(`/templates/basic_XXXXX/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
      after(function (done) {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'DEFAULT_USER/basic_a.json',
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

  describe('s3 write error', function () {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4571;
    const s3endpoint = `http://${hostname}:${s3port}`;
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
          app = new App(
            [
              new TemplatesController({
                userIdHeader: 'MyAuthHeader',
                s3conf: {
                  bucket: bucketName,
                  accessKeyId: 'S3RVERZZZZZZZ',
                  secretAccessKey: 'S3XXXXXXXXXXXXXXRVER',
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

    after(function (done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });

    it(`creating template will fail`, function (done) {
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
            assert(content.indexOf(`could not save to backend`) > -1);
            done();
          });
      }, 1000);
    });

    it(`health not ok`, function (done) {
      chai
        .request(app)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(503);
          done();
        });
    });
  });

  describe('with templates at startup', function () {
    let app;
    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4571;
    const s3endpoint = `http://${hostname}:${s3port}`;

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
          const validTemplate = JSON.parse(helper.getTestTemplate('basic_a'));
          validTemplate.user = 'DEFAULT_USER';
          s3client.upload(
            {
              Bucket: bucketName,
              Key: 'DEFAULT_USER/basic_a.json',
              Body: JSON.stringify(validTemplate),
            },
            (err) => {
              if (err) {
                console.log(err);
              }
              s3client.upload(
                {
                  Bucket: bucketName,
                  Key: 'DEFAULT_USER/basic_b.json',
                  Body: 'bla bla bla',
                },
                (err) => {
                  if (err) {
                    console.log(err);
                  }

                  s3client.upload(
                    {
                      Bucket: bucketName,
                      Key: 'DUMMY.json',
                      Body: 'dummy',
                    },
                    (err) => {
                      if (err) {
                        console.log(err);
                      }
                      app = new App(
                        [
                          new TemplatesController({
                            userIdHeader: 'MyAuthHeader',
                            s3conf: {
                              bucket: bucketName,
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
            },
          );
        });
      });
    });

    it('list should contain 2 templates', function (done) {
      // server starts aynchronously and needs some time
      setTimeout(() => {
        chai
          .request(app)
          .get('/templates')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.strictEqual(content.ids.length, 2);
            assert(content.ids.indexOf('basic_a') > -1);
            assert(content.ids.indexOf('basic_b') > -1);
            done();
          });
      }, 1000);
    });

    after(function (done) {
      app.close(() => {
        s3client.deleteObject(
          {
            Bucket: bucketName,
            Key: 'DEFAULT_USER/basic_a.json',
          },
          (err) => {
            if (err) {
              console.log(err);
            }
            s3client.deleteObject(
              {
                Bucket: bucketName,
                Key: 'DEFAULT_USER/basic_b.json',
              },
              (err) => {
                if (err) {
                  console.log(err);
                }
                s3client.deleteObject(
                  {
                    Bucket: bucketName,
                    Key: 'DUMMY.json',
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
          },
        );
      });
    });
  });

  describe('with s3 that fails', function () {
    let app;

    let s3instance;
    const testFolder = 'test-fake-s3';
    const bucketName = 'test-bucket';
    const hostname = 'localhost';
    const s3port = 4571;
    const s3endpoint = `http://${hostname}:${s3port}`;

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
          app = new App(
            [
              new TemplatesController({
                userIdHeader: 'MyAuthHeader',
                s3conf: {
                  bucket: bucketName,
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
    after(function (done) {
      app.close(() => {
        s3instance.close(() => {
          fs.rmdir(`${testFolder}/${bucketName}`, () => {
            fs.rmdir(testFolder, () => {
              done();
            });
          });
        });
      });
    });

    it('list should fail', function (done) {
      chai
        .request(app)
        .get('/templates')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
    it('create should 500', function (done) {
      chai
        .request(app)
        .post('/templates')
        .set('content-type', 'application/json')
        .send(helper.getTestTemplate('basic_a'))
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });
});
