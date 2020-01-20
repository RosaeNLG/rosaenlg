const assert = require('assert');
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

const testFolder = 'test-templates-testing';
let app;

function changeTemplateOnDisk() {
  const originalTemplate = fs.readFileSync(`${testFolder}/DEFAULT_USER#basic_a.json`, 'utf8');
  const changedTemplate = originalTemplate.replace('aaa', 'bbb').replace('Aaa', 'Bbb');
  fs.writeFileSync(`${testFolder}/DEFAULT_USER#basic_a.json`, changedTemplate, 'utf8');
}

describe('reload', function() {
  before(function(done) {
    fs.mkdir(testFolder, () => {
      process.env.ROSAENLG_HOMEDIR = testFolder;
      app = new App([new TemplatesController({ templatesPath: process.env.ROSAENLG_HOMEDIR })], 5000).server;
      done();
    });
  });
  after(function(done) {
    app.close(() => {
      fs.rmdir(testFolder, () => {
        done();
      });
    });
  });

  describe('modify and not reload', function() {
    let originalSha1;
    before(function(done) {
      helper.createTemplate(app, 'basic_a', _originalSha1 => {
        originalSha1 = _originalSha1;
        changeTemplateOnDisk();
        done();
      });
    });

    it(`should not change anything`, function(done) {
      chai
        .request(app)
        .post(`/templates/basic_a/${originalSha1}/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert(content.renderedText.indexOf(['Aaa']) > -1, `content: ${content.renderedText}`);
          done();
        });
    });
    after(function(done) {
      helper.deleteTemplate(app, 'basic_a', () => {
        done();
      });
    });
  });

  describe('modify and reload', function() {
    let originalSha1;
    let newSha1;
    before(function(done) {
      helper.createTemplate(app, 'basic_a', _sha1 => {
        originalSha1 = _sha1;
        changeTemplateOnDisk();
        chai
          .request(app)
          .put(`/templates/basic_a/reload`)
          .end((err, res) => {
            newSha1 = res.body.templateSha1;
            done();
          });
      });
    });

    it(`should have changed`, function(done) {
      assert.notEqual(originalSha1, newSha1);
      chai
        .request(app)
        .post(`/templates/basic_a/${newSha1}/render`)
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
      helper.deleteTemplate(app, 'basic_a', () => {
        done();
      });
    });
  });
});
