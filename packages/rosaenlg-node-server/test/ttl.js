const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('ttl', function () {
  before(function () {
    process.env.JWT_USE = false;
  });
  after(function () {
    helper.resetEnv();
  });

  describe('specific ttl', function () {
    const testFolder = 'test-templates-ttl';
    let app;
    let templateSha1;
    before(function (done) {
      fs.mkdir(testFolder, () => {
        app = new App(
          [
            new TemplatesController({
              templatesPath: testFolder,
              userIdHeader: 'MyAuthHeader',
              behavior: { forgetTemplates: true, cacheTtl: 1, checkPeriod: 1 },
            }),
          ],
          5000,
        ).server;
        chai
          .request(app)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            const content = res.body;
            templateSha1 = content.templateSha1;
            done();
          });
      });
    });

    it(`loaded properly`, function (done) {
      assert(templateSha1 != null);
      done();
    });
    it(`render works`, function (done) {
      chai
        .request(app)
        .post(`/templates/basic_a/${templateSha1}/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          res.should.have.status(200);
          const content = res.body;
          assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
          done();
        });
    });

    it(`render works after a few seconds`, function (done) {
      this.timeout(2500);
      setTimeout(() => {
        chai
          .request(app)
          .post(`/templates/basic_a/${templateSha1}/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            const content = res.body;
            assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
            done();
          });
      }, 2000);
    });

    after(function (done) {
      helper.deleteTemplate(app, 'basic_a', () => {
        app.close(() => {
          fs.rmdir(testFolder, done);
        });
      });
    });
  });
  describe('forget templates but no backend', function () {
    let app;
    before(function (done) {
      app = new App(
        [
          new TemplatesController({
            userIdHeader: 'MyAuthHeader',
            behavior: { forgetTemplates: true },
          }),
        ],
        5001,
      ).server;
      done();
    });

    it(`load works`, function (done) {
      chai
        .request(app)
        .post('/templates')
        .set('content-type', 'application/json')
        .send(helper.getTestTemplate('basic_a'))
        .end((err, res) => {
          const content = res.body;
          assert(content.templateSha1 != null);
          done();
        });
    });

    after(function (done) {
      app.close();
      done();
    });
  });
});
