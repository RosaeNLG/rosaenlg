const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('compilation', function() {
  describe('file with no comp content', function() {
    const testFolder = 'test-templates-comp';
    let app;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        done();
      });
    });

    describe('do it', function() {
      let templateSha1;
      before(function(done) {
        helper.createTemplate(app, 'inc_param', _sha1 => {
          templateSha1 = _sha1;
          done();
        });
      });
      it(`file is saved and with proper content`, function(done) {
        fs.readFile(`${testFolder}/DEFAULT_USER#inc_param.json`, 'utf8', (err, data) => {
          assert(!err, err);
          const parsedData = JSON.parse(data);
          assert(parsedData.comp != null);
          assert(parsedData.comp.compiledWithVersion != null && parsedData.comp.compiledWithVersion != '');
          assert(parsedData.comp.compiled != null && parsedData.comp.compiled != '');
          done();
        });
      });
      it(`render works`, function(done) {
        chai
          .request(app)
          .post(`/templates/inc_param/${templateSha1}/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US', param: 'you' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert('en_US', content.renderOptions.language);
            assert(content.renderedText.indexOf('you') > -1, content.renderedText);
            done();
          });
      });

      after(function(done) {
        helper.deleteTemplate(app, 'inc_param', done);
      });
    });

    after(function(done) {
      app.close(() => {
        fs.rmdir(testFolder, done);
      });
    });
  });

  describe('check comp at startup', function() {
    const testFolder = 'test-templates-comp-startup';
    let app;

    before(function(done) {
      fs.mkdir(testFolder, () => {
        const filename = `${testFolder}/DEFAULT_USER#inc_param.json`;
        const template = JSON.parse(helper.getTestTemplate('inc_param'));
        template.user = 'DEFAULT_USER';
        fs.writeFile(filename, JSON.stringify(template), 'utf8', () => {
          app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
          done();
        });
      });
    });
    it(`has compiled and saved`, function(done) {
      setTimeout(() => {
        // we have to wait so that load and comp is done
        fs.readFile(`${testFolder}/DEFAULT_USER#inc_param.json`, 'utf8', (err, data) => {
          assert(!err, err);
          const parsedData = JSON.parse(data);
          assert(parsedData.comp != null);
          assert(parsedData.comp.compiled != null && parsedData.comp.compiled != '');
          assert(parsedData.comp.compiledBy != null);
          assert(parsedData.comp.compiledWhen != null);
          // console.log(parsedData.comp);
          done();
        });
      }, 1000);
    });

    after(function(done) {
      helper.deleteTemplate(app, 'inc_param', () => {
        app.close(() => {
          fs.rmdir(testFolder, done);
        });
      });
    });
  });

  describe('check no recomp', function() {
    const testFolder = 'test-templates-no-recomp';
    let compiledWhen;
    let templateSha1;

    before(function(done) {
      fs.mkdir(testFolder, () => {
        const firstApp = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;

        helper.createTemplate(firstApp, 'inc_param', _sha1 => {
          templateSha1 = _sha1;

          fs.readFile(`${testFolder}/DEFAULT_USER#inc_param.json`, 'utf8', (err, data) => {
            assert(!err, err);
            const parsedData = JSON.parse(data);
            assert(parsedData.comp != null);
            assert(parsedData.comp.compiled != null && parsedData.comp.compiled != '');
            assert(parsedData.comp.compiledBy != null);
            assert(parsedData.comp.compiledWhen != null);

            compiledWhen = parsedData.comp.compiledWhen;

            parsedData.comp.compiledBy = 'CHECK';

            fs.writeFile(`${testFolder}/DEFAULT_USER#inc_param.json`, JSON.stringify(parsedData), 'utf8', () => {
              firstApp.close(() => {
                done();
              });
            });
          });
        });
      });
    });

    let app;

    describe('do it', function() {
      before(function(done) {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        done();
      });

      it(`render works`, function(done) {
        setTimeout(() => {
          // we have to wait so that reload is done
          chai
            .request(app)
            .post(`/templates/inc_param/${templateSha1}/render`)
            .set('content-type', 'application/json')
            .send({ language: 'en_US', param: 'you' })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              const content = res.body;
              assert('en_US', content.renderOptions.language);
              assert(content.renderedText.indexOf('you') > -1, content.renderedText);
              done();
            });
        });
      }, 1000);

      it(`has not recompiled`, function(done) {
        fs.readFile(`${testFolder}/DEFAULT_USER#inc_param.json`, 'utf8', (err, data) => {
          assert(!err, err);
          const parsedData = JSON.parse(data);
          assert(parsedData.comp != null);
          assert.equal(parsedData.comp.compiledWhen, compiledWhen);
          assert.equal(parsedData.comp.compiledBy, 'CHECK');
          done();
        });
      });
    });

    after(function(done) {
      helper.deleteTemplate(app, 'inc_param', () => {
        app.close(() => {
          fs.rmdir(testFolder, done);
        });
      });
    });
  });
});
