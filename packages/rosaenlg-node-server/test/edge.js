const assert = require('assert');
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('edge', function() {
  describe('without persistence', function() {
    let app;
    before(function() {
      app = new App([new TemplatesController(null)], 5000).server;
    });
    after(function() {
      app.close();
    });
    describe(`reload must fail`, function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', done);
      });

      it(`reload 1 template fails`, function(done) {
        chai
          .request(app)
          .put(`/templates/basic_a/reload`)
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    it(`delete on template that does not exist`, function(done) {
      chai
        .request(app)
        .delete(`/templates/blabla`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it(`get on template that does not exist`, function(done) {
      chai
        .request(app)
        .get(`/templates/blabla`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    describe(`render error`, function() {
      before(function(done) {
        helper.createTemplate(app, 'chanson', done);
      });

      it(`render err`, function(done) {
        chai
          .request(app)
          .post(`/templates/chanson/render`)
          .set('content-type', 'application/json')
          .send({
            language: 'fr_FR',
          })
          .end((err, res) => {
            res.should.have.status(400);
            const content = res.text;
            assert(content.indexOf(`Cannot read property 'nom' of undefined`) > -1);
            done();
          });
      });

      after(function(done) {
        helper.deleteTemplate(app, 'chanson', done);
      });
    });

    it(`create template with no ID`, function(done) {
      const parsedTemplate = JSON.parse(helper.getTestTemplate('basic_a'));
      delete parsedTemplate.templateId;
      chai
        .request(app)
        .put('/templates')
        .set('content-type', 'application/json')
        .send(JSON.stringify(parsedTemplate))
        .end((err, res) => {
          res.should.have.status(400);
          assert(res.text.indexOf('templateId') > -1);
          done();
        });
    });

    it(`wrong autotest: not able to render`, function(done) {
      const parsedTemplate = JSON.parse(helper.getTestTemplate('chanson'));
      delete parsedTemplate.autotest.input.chanson;
      chai
        .request(app)
        .put('/templates')
        .set('content-type', 'application/json')
        .send(JSON.stringify(parsedTemplate))
        .end((err, res) => {
          res.should.have.status(400);
          assert(res.text.indexOf('cannot render autotest') > -1);
          done();
        });
    });

    it(`wrong autotest: rendered content not ok`, function(done) {
      const parsedTemplate = JSON.parse(helper.getTestTemplate('chanson'));
      parsedTemplate.autotest.expected = ['bla bla bla'];
      chai
        .request(app)
        .put('/templates')
        .set('content-type', 'application/json')
        .send(JSON.stringify(parsedTemplate))
        .end((err, res) => {
          res.should.have.status(400);
          assert(res.text.indexOf('failed') > -1, res.text);
          assert(res.text.indexOf('rendered') > -1, res.text);
          done();
        });
    });
    it(`cannot compile template`, function(done) {
      const parsedTemplate = JSON.parse(helper.getTestTemplate('chanson'));
      parsedTemplate.templates['chanson.pug'] = 'include blabla';
      chai
        .request(app)
        .put('/templates')
        .set('content-type', 'application/json')
        .send(JSON.stringify(parsedTemplate))
        .end((err, res) => {
          res.should.have.status(400);
          // console.log(res.text);
          assert(res.text.indexOf('cannot compile') > -1, res.text);
          done();
        });
    });
    describe('no autotest', function() {
      it(`creating template should be ok`, function(done) {
        const parsedTemplate = JSON.parse(helper.getTestTemplate('basic_a'));
        delete parsedTemplate.autotest;
        chai
          .request(app)
          .put('/templates')
          .set('content-type', 'application/json')
          .send(JSON.stringify(parsedTemplate))
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
  });

  describe('blablabla with persistence', function() {
    const testFolder = 'test-templates-edge-persist';
    let app;
    before(function(done) {
      const filename = `${testFolder}/DEFAULT_USER_basic_a.json`;
      fs.mkdir(testFolder, () => {
        const template = JSON.parse(helper.getTestTemplate('basic_a'));
        template.user = 'DEFAULT_USER';
        fs.writeFile(filename, JSON.stringify(template), 'utf8', () => {
          app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
          fs.unlink(filename, () => {
            fs.rmdir(testFolder, done);
          });
        });
      });
    });
    it('template is here', function(done) {
      chai
        .request(app)
        .get('/templates')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal(content.ids.length, 1);
          assert.equal(content.ids[0], 'basic_a');
          done();
        });
    });
    it('delete must fail badly', function(done) {
      chai
        .request(app)
        .delete(`/templates/basic_a`)
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    after(function() {
      app.close();
    });
  });
});
