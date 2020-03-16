const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

function remove(filename, testFolder, app, done) {
  app.close(() => {
    fs.unlink(filename, () => {
      fs.rmdir(testFolder, done);
    });
  });
}

describe('persistence', function() {
  describe('empty startup', function() {
    const testFolder = 'test-templates-persist';
    let app;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        done();
      });
    });

    describe('nominal cycle', function() {
      let templateSha1;
      before(function(done) {
        helper.createTemplate(app, 'basic_a', _sha1 => {
          templateSha1 = _sha1;
          done();
        });
      });
      it(`file is saved`, function(done) {
        fs.stat(`${testFolder}/DEFAULT_USER#basic_a.json`, (err, stats) => {
          assert(!err, err);
          done();
        });
      });
      it(`render works`, function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${templateSha1}/render`)
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

      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('delete', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', () => {
          helper.deleteTemplate(app, 'basic_a', done);
        });
      });
      it(`file should not be here`, function(done) {
        fs.stat(`${testFolder}/DEFAULT_USER#basic_a.json`, (err, stats) => {
          assert(err);
          done();
        });
      });
    });

    describe('edge cases', function() {
      describe('reload on template that does not exist', function() {
        it(`reload should not work`, function(done) {
          chai
            .request(app)
            .put(`/templates/xxxxxxx/reload`)
            .end((err, res) => {
              res.should.have.status(404);
              assert(res.text.indexOf('not exist') > -1, res.text);
              done();
            });
        });
      });

      describe('invalid template on disk', function() {
        before(function(done) {
          const parsedTemplate = JSON.parse(helper.getTestTemplate('chanson'));
          parsedTemplate.src.templates['chanson.pug'] = 'include blabla';
          fs.writeFile(`${testFolder}/DEFAULT_USER#chanson.json`, JSON.stringify(parsedTemplate), 'utf8', done);
        });
        it(`reload should not work`, function(done) {
          chai
            .request(app)
            .put(`/templates/chanson/reload`)
            .end((_err, res) => {
              res.should.have.status(404);
              assert(res.text.indexOf('or invalid template') > -1, res.text);
              done();
            });
        });

        it(`get should fail`, function(done) {
          chai
            .request(app)
            .get(`/templates/chanson`)
            .end((_err, res) => {
              res.should.have.status(400);
              assert(res.text.indexOf('cannot compile') > -1, res.text);
              done();
            });
        });

        after(function(done) {
          // cannot use delete as it has not been properly loaded
          fs.unlink(`${testFolder}/DEFAULT_USER#chanson.json`, () => {
            done();
          });
        });
      });
    });

    after(function(done) {
      app.close(() => {
        fs.rmdir(testFolder, done);
      });
    });
  });

  describe('wrong sha1 on render', function() {
    const testFolder = 'test-templates-wrong-sha1';
    let app;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        done();
      });
    });

    describe('nominal cycle', function() {
      let templateSha1;
      before(function(done) {
        helper.createTemplate(app, 'basic_a', _sha1 => {
          templateSha1 = _sha1;
          done();
        });
      });
      it(`render works with good sha1`, function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${templateSha1}/render`)
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
      it(`render fails with wrong sha1`, function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/wrongsha1/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });

      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    after(function(done) {
      app.close(() => {
        fs.rmdir(testFolder, done);
      });
    });
  });

  describe('with templates on startup', function() {
    const testFolder = 'test-templates-persist-exist';
    let app;
    const filenameBasicA = `${testFolder}/DEFAULT_USER#basic_a.json`;
    const filenameBasicB = `${testFolder}/DEFAULT_USER#basic_b.json`;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        const templateBasicA = JSON.parse(helper.getTestTemplate('basic_a'));
        templateBasicA.user = 'DEFAULT_USER';
        fs.writeFile(filenameBasicA, JSON.stringify(templateBasicA), 'utf8', () => {
          const templateBasicB = JSON.parse(helper.getTestTemplate('basic_b'));
          templateBasicB.user = 'DEFAULT_USER';
          fs.writeFile(filenameBasicB, JSON.stringify(templateBasicB), 'utf8', () => {
            app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
            done();
          });
        });
      });
    });
    it('template is here', function(done) {
      chai
        .request(app)
        .get('/templates')
        .end((_err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal(content.ids.length, 2);
          assert(content.ids.indexOf('basic_a') > -1);
          done();
        });
    });
    after(function(done) {
      fs.unlink(filenameBasicB, () => {
        remove(filenameBasicA, testFolder, app, () => {
          done();
        });
      });
    });
  });

  describe('with invalid templates on startup', function() {
    const testFolder = 'test-templates-persist-invalid';
    let app;
    const filename = `${testFolder}/DEFAULT_USER#invalid.json`;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        fs.writeFile(filename, 'some { bla bla', 'utf8', () => {
          app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
          done();
        });
      });
    });
    it('template is not here', function(done) {
      chai
        .request(app)
        .get('/templates')
        .end((_err, res) => {
          res.should.have.status(200);
          const content = res.body;
          assert.equal(content.ids.length, 1);
          done();
        });
    });
    after(function(done) {
      remove(filename, testFolder, app, done);
    });
  });

  describe('dummy files on startup', function() {
    const testFolder = 'test-templates-persist-dummy';
    let app;
    const filename = `${testFolder}/somefile.txt`;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        fs.writeFile(filename, 'bla bla', 'utf8', () => {
          setTimeout(() => {
            app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
            done();
          }, 500);
        });
      });
    });
    it('template is not here', function(done) {
      chai
        .request(app)
        .get('/templates')
        .end((_err, res) => {
          res.should.have.status(200);
          const content = res.body;
          assert.equal(content.ids.length, 0);
          done();
        });
    });
    after(function(done) {
      remove(filename, testFolder, app, done);
    });
  });

  describe('cannot save template', function() {
    const testFolder = 'test-templates-persist-err';
    let app;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        fs.rmdir(testFolder, done);
      });
    });

    it(`creating template will fail`, function() {
      chai
        .request(app)
        .post('/templates')
        .set('content-type', 'application/json')
        .send(helper.getTestTemplate('basic_b'))
        .end((err, res) => {
          res.should.have.status(500);
          const content = res.text;
          assert(content.indexOf(`could not save to backend`) > -1);
        });
    });

    after(function(done) {
      app.close();
      done();
    });
  });

  describe('wrong templates path', function() {
    let app;
    before(function(done) {
      app = new App([new TemplatesController({ templatesPath: 'bla bla bla' })], 5000).server;
      done();
    });
    it(`creating template will fail`, function() {
      chai
        .request(app)
        .post('/templates')
        .set('content-type', 'application/json')
        .send(helper.getTestTemplate('basic_b'))
        .end((err, res) => {
          res.should.have.status(500);
          const content = res.text;
          assert(content.indexOf(`could not save to backend`) > -1);
        });
    });

    after(function(done) {
      app.close();
      done();
    });
  });

  describe('multiple users', function() {
    const testFolder = 'test-templates-persist-users';
    let app;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        app = new App([new TemplatesController({ templatesPath: testFolder })], 5000).server;
        done();
      });
    });

    describe('each user sees his templates', function() {
      before(function(done) {
        helper.createTemplateForUser(app, 'user1', 'basic_a', () => {
          helper.createTemplateForUser(app, 'user2', 'basic_b', () => {
            helper.createTemplateForUser(app, 'user1', 'chanson', done);
          });
        });
      });
      it('user1 should see 2 templates', function(done) {
        chai
          .request(app)
          .get('/templates')
          .set('X-RapidAPI-User', 'user1')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.ids.length, 2);
            assert(content.ids.indexOf('basic_a') > -1);
            assert(content.ids.indexOf('chanson') > -1);
            done();
          });
      });
      it('user2 should see 1 templates', function(done) {
        chai
          .request(app)
          .get('/templates')
          .set('X-RapidAPI-User', 'user2')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.ids.length, 1);
            assert(content.ids.indexOf('basic_b') > -1);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplateForUser(app, 'user1', 'basic_a', () => {
          helper.deleteTemplateForUser(app, 'user1', 'chanson', () => {
            helper.deleteTemplateForUser(app, 'user2', 'basic_b', done);
          });
        });
      });
    });

    describe('another user cannot access templates', function() {
      let basicASha1;
      before(function(done) {
        helper.createTemplateForUser(app, 'user1', 'basic_a', _basicASha1 => {
          basicASha1 = _basicASha1;
          helper.createTemplateForUser(app, 'user1', 'basic_b', done);
        });
      });
      it('other cannot get template', function(done) {
        chai
          .request(app)
          .get(`/templates/basic_a`)
          .set('X-RapidAPI-User', 'other')
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
      it('other cannot delete template', function(done) {
        chai
          .request(app)
          .delete(`/templates/basic_a`)
          .set('X-RapidAPI-User', 'other')
          .end((err, res) => {
            res.should.have.status(204);
            done();
          });
      });
      it('other cannot render template', function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${basicASha1}/render`)
          .set('X-RapidAPI-User', 'other')
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
      it('other cannot reload template', function(done) {
        chai
          .request(app)
          .put(`/templates/basic_a/reload`)
          .set('X-RapidAPI-User', 'other')
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplateForUser(app, 'user1', 'basic_a', () => {
          helper.deleteTemplateForUser(app, 'user1', 'basic_b', done);
        });
      });
    });

    after(function(done) {
      app.close(() => {
        fs.rmdir(testFolder, done);
      });
    });
  });
});
