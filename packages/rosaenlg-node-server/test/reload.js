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
  const originalTemplate = fs.readFileSync(`${testFolder}/DEFAULT_USER_basic_a.json`, 'utf8');
  const changedTemplate = originalTemplate.replace('aaa', 'bbb').replace('Aaa', 'Bbb');
  fs.writeFileSync(`${testFolder}/DEFAULT_USER_basic_a.json`, changedTemplate, 'utf8');
}

describe('reload', function() {
  before(function() {
    fs.mkdirSync(testFolder);
    process.env.ROSAENLG_HOMEDIR = testFolder;
    app = new App([new TemplatesController({ templatesPath: process.env.ROSAENLG_HOMEDIR })], 5000).server;
  });
  after(function() {
    app.close();
    fs.rmdirSync(testFolder);
  });

  describe('modify and not reload', function(done) {
    before(function(done) {
      helper.createTemplate(app, 'basic_a', function() {
        changeTemplateOnDisk();
        done();
      });
    });

    it(`should not change anything`, function(done) {
      chai
        .request(app)
        .post(`/templates/basic_a/render`)
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
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });

  describe('modify and reload', function(done) {
    before(function(done) {
      helper.createTemplate(app, 'basic_a', function() {
        changeTemplateOnDisk();
        chai
          .request(app)
          .put(`/templates/basic_a/reload`)
          .end((err, res) => {
            done();
          });
      });
    });

    it(`should have changed`, function(done) {
      chai
        .request(app)
        .post(`/templates/basic_a/render`)
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
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });
});
