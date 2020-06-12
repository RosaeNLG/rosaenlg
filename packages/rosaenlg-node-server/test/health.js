const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('health', function () {
  before(function () {
    process.env.JWT_USE = true; // but must work as not protected
  });
  after(function () {
    helper.resetEnv();
  });

  describe('without server path', function () {
    let app;
    before(function () {
      app = new App([new TemplatesController(null)], 5000).server;
    });
    it('basic', function (done) {
      chai
        .request(app)
        .get('/health')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    after(function () {
      app.close();
    });
  });

  describe('with server path', function () {
    describe('basic', function () {
      let app;
      const testFolder = 'test-health';
      before(function (done) {
        fs.mkdir(testFolder, () => {
          app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
          done();
        });
      });
      it('basic', function (done) {
        chai
          .request(app)
          .get('/health')
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });
      after(function (done) {
        app.close(() => {
          fs.rmdir(testFolder, () => {
            done();
          });
        });
      });
    });
    describe('removing folder', function () {
      let app;
      const testFolder = 'test-health-bad';
      before(function (done) {
        fs.mkdir(testFolder, () => {
          app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
          fs.rmdir(testFolder, () => {
            done();
          });
        });
      });
      it('health not ok', function (done) {
        chai
          .request(app)
          .get('/health')
          .end((err, res) => {
            res.should.have.status(503);
            const content = res.text;
            assert(content.indexOf(`health failed`) > -1);
            done();
          });
      });
      after(function (done) {
        app.close(() => {
          done();
        });
      });
    });
  });
});
