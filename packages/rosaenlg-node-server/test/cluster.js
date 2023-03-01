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

chai.use(chaiHttp);
chai.should();

function createTestFile(name, filename, cb) {
  const template = JSON.parse(helper.getTestTemplate(name));
  template.user = 'DEFAULT_USER';
  fs.writeFile(filename, JSON.stringify(template), 'utf8', cb);
}

describe('cluster', function () {
  before(function () {
    process.env.JWT_USE = false;
  });
  after(function () {
    helper.resetEnv();
  });

  describe('templates not loaded on startup', function () {
    const testFolder = 'cluster';
    let app;
    const filename = `${testFolder}/DEFAULT_USER#basic_a.json`;
    beforeEach(function (done) {
      fs.mkdir(testFolder, () => {
        createTestFile('basic_a', filename, () => {
          app = new App(
            [
              new TemplatesController({
                templatesPath: testFolder,
                userIdHeader: 'MyAuthHeader',
                behavior: { lazyStartup: true },
              }),
            ],
            5010,
          ).server;
          done();
        });
      });
    });
    afterEach(function (done) {
      fs.unlink(filename, () => {
        fs.rmdir(testFolder, () => {
          app.close();
          done();
        });
      });
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
    it(`get template content should work`, function (done) {
      chai
        .request(app)
        .get(`/templates/basic_a`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.strictEqual(content.templateContent.templateId, 'basic_a');
          done();
        });
    });
    it(`get dummy template content should not work`, function (done) {
      chai
        .request(app)
        .get(`/templates/aaaa`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    describe('delete', function () {
      it('delete should work', function (done) {
        chai
          .request(app)
          .delete(`/templates/basic_a`)
          .end((err, res) => {
            res.should.have.status(204);
            fs.stat(filename, (err, stats) => {
              assert(err);
              done();
            });
          });
      });
      after(function (done) {
        createTestFile('basic_a', filename, () => {
          done();
        });
      });
    });
    describe('create', function () {
      it('create should still work', function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            const content = res.body;
            assert.strictEqual(content.templateId, 'basic_a');
            fs.stat(filename, (err, stats) => {
              assert(!err);
              done();
            });
          });
      });
      after(function (done) {
        fs.unlink(filename, () => {
          done();
        });
      });
    });
    describe('lazy load invalid one', function () {
      const filenameInvalid = `${testFolder}/DEFAULT_USER#basic_b.json`;
      it('should not render', function (done) {
        fs.writeFile(filenameInvalid, 'INVALID CONTENT DUMMY', 'utf8', (err) => {
          if (err) {
            console.log(err);
          }
          chai
            .request(app)
            .get(`/templates/basic_b`)
            .end((err, res) => {
              res.should.have.status(400);
              fs.unlink(filenameInvalid, () => {
                done();
              });
            });
        });
      });
    });
  });
  describe('2 servers', function () {
    const testFolder = '2servers';
    let sha1;
    let app1;
    let app2;
    before(function (done) {
      fs.mkdir(testFolder, () => {
        app1 = new App(
          [
            new TemplatesController({
              templatesPath: testFolder,
              userIdHeader: 'MyAuthHeader',
              behavior: { lazyStartup: true },
            }),
          ],
          5002,
        ).server;
        app2 = new App(
          [
            new TemplatesController({
              templatesPath: testFolder,
              userIdHeader: 'MyAuthHeader',
              behavior: { lazyStartup: true },
            }),
          ],
          5003,
        ).server;
        done();
      });
    });
    it('app1 can create', function (done) {
      chai
        .request(app1)
        .post('/templates')
        .set('content-type', 'application/json')
        .send(helper.getTestTemplate('basic_a'))
        .end((err, res) => {
          res.should.have.status(201);
          sha1 = res.body.templateSha1;
          assert(sha1 != null);
          done();
        });
    });

    it('app1 can render', function (done) {
      chai
        .request(app1)
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
    it('app2 can render', function (done) {
      chai
        .request(app2)
        .post(`/templates/basic_a/${sha1}/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          console.log('XXX ' + JSON.stringify(res));
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert('en_US', content.renderOptions.language);
          assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
          done();
        });
    });

    it('app2 can render and will not reload', function (done) {
      // this is checked in the logs
      chai
        .request(app2)
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
      fs.unlink(`${testFolder}/DEFAULT_USER#basic_a.json`, () => {
        fs.rmdir(testFolder, () => {
          app1.close();
          app2.close();
          done();
        });
      });
    });
  });
});
