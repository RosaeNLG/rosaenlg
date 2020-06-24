const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

let app;

describe('basic', function () {
  before(function () {
    process.env.JWT_USE = false;
    app = new App([new TemplatesController(null)], 5000).server;
  });
  after(function () {
    app.close();
    helper.resetEnv();
  });

  it('initial template list must be empty', function (done) {
    chai
      .request(app)
      .get('/templates')
      .end((_err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.ids);
        assert.equal(content.ids.length, 0);
        done();
      });
  });

  describe('creating template', function () {
    describe('with post', function () {
      it('create a template', function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.templateId, 'basic_a');
            assert(content.templateSha1 != null);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
    describe('with put', function () {
      it('create a template', function (done) {
        chai
          .request(app)
          .put('/templates')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.templateId, 'basic_a');
            assert(content.templateSha1 != null);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
  });

  describe('list should contain a created template', function () {
    before(function (done) {
      helper.createTemplate(app, 'basic_a', (sha1) => {
        done();
      });
    });
    it('basic_a should be in the list', function (done) {
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

    after(function (done) {
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });

  describe('render', function () {
    let templateSha1;
    before(function (done) {
      helper.createTemplate(app, 'basic_a', (sha1) => {
        templateSha1 = sha1;
        done();
      });
    });
    it('render', function (done) {
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
          assert.equal(content.templateSha1, templateSha1);
          done();
        });
    });
    after(function (done) {
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });

  describe('delete', function () {
    describe('just delete', function () {
      before(function (done) {
        helper.createTemplate(app, 'basic_a', (sha1) => {
          done();
        });
      });
      it('delete should work', function (done) {
        chai
          .request(app)
          .delete(`/templates/basic_a`)
          .end((err, res) => {
            res.should.have.status(204);
            done();
          });
      });
    });
    describe('check empty list after delete', function () {
      before(function (done) {
        helper.createTemplate(app, 'basic_a', function () {
          helper.deleteTemplate(app, 'basic_a', done);
        });
      });
      it('should be empty', function (done) {
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
    describe('check cannot render after delete', function () {
      before(function (done) {
        helper.createTemplate(app, 'basic_a', function () {
          helper.deleteTemplate(app, 'basic_a', done);
        });
      });
      it('cannot render', function (done) {
        chai
          .request(app)
          .post(`/templates/basic_a/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
      });
    });
  });

  describe('update template', function () {
    describe('just update with same content', function () {
      let initialTemplateSha1;
      before(function (done) {
        helper.createTemplate(app, 'basic_a', (sha1) => {
          initialTemplateSha1 = sha1;
          done();
        });
      });
      it('update', function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal(content.templateId, 'basic_a');
            assert(content.templateSha1 != null);
            assert.equal(content.templateSha1, initialTemplateSha1);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('render after update', function () {
      let templateSha1;
      before(function (done) {
        helper.createTemplate(app, 'basic_a', function () {
          helper.createTemplate(app, 'basic_a', (sha1) => {
            templateSha1 = sha1;
            done();
          });
        });
      });
      it('update', function (done) {
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
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('real update with content change', function () {
      let newSha1;
      before(function (done) {
        helper.createTemplate(app, 'basic_a', function () {
          const templateOriginal = helper.getTestTemplate('basic_a');
          const templateModified = templateOriginal.replace('aaa', 'ccc').replace('Aaa', 'Ccc');
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(templateModified)
            .end((err, res) => {
              const content = res.body;
              newSha1 = content.templateSha1;
              done();
            });
        });
      });
      it('test render on updated template', function (done) {
        chai
          .request(app)
          .post(`/templates/basic_a/${newSha1}/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            const content = res.body;
            assert(content.renderedText.indexOf('Ccc') > -1, content.renderedText);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
  });

  describe('multiple templates', function () {
    let basicASha1;
    let basicBSha1;
    let chansonSha1;
    beforeEach(function (done) {
      helper.createTemplate(app, 'basic_a', (_basicASha1) => {
        basicASha1 = _basicASha1;
        helper.createTemplate(app, 'basic_b', (_basicBSha1) => {
          basicBSha1 = _basicBSha1;
          helper.createTemplate(app, 'chanson', (_chansonSha1) => {
            chansonSha1 = _chansonSha1;
            done();
          });
        });
      });
    });
    it(`3 elements in the list`, function (done) {
      chai
        .request(app)
        .get('/templates')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal(content.ids.length, 3);
          assert(content.ids.indexOf('basic_a') > -1);
          assert(content.ids.indexOf('basic_b') > -1);
          assert(content.ids.indexOf('chanson') > -1);
          done();
        });
    });
    it(`second template renders well`, function (done) {
      chai
        .request(app)
        .post(`/templates/basic_b/${basicBSha1}/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert('en_US', content.renderOptions.language);
          assert(content.renderedText.indexOf('Bbb') > -1, content.renderedText);
          done();
        });
    });
    it(`last template renders well`, function (done) {
      chai
        .request(app)
        .post(`/templates/chanson/${chansonSha1}/render`)
        .set('content-type', 'application/json')
        .send({
          language: 'fr_FR',
          chanson: {
            auteur: 'Édith Piaf',
            nom: 'Non, je ne regrette rien',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert('en_US', content.renderOptions.language);
          assert(
            content.renderedText.indexOf(`Il chantera "Non, je ne regrette rien" d'Édith Piaf`) > -1,
            content.renderedText,
          );
          done();
        });
    });
    afterEach(function (done) {
      helper.deleteTemplate(app, 'basic_a', () => {
        helper.deleteTemplate(app, 'basic_b', () => {
          helper.deleteTemplate(app, 'chanson', done);
        });
      });
    });
  });

  describe('render with params', function () {
    let chansonSha1;
    before(function (done) {
      helper.createTemplate(app, 'chanson', (_chansonSha1) => {
        chansonSha1 = _chansonSha1;
        done();
      });
    });
    it(`should render`, function (done) {
      chai
        .request(app)
        .post(`/templates/chanson/${chansonSha1}/render`)
        .set('content-type', 'application/json')
        .send({
          language: 'fr_FR',
          chanson: {
            auteur: 'Édith Piaf',
            nom: 'Non, je ne regrette rien',
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert(
            content.renderedText.indexOf(`Il chantera "Non, je ne regrette rien" d'Édith Piaf`) > -1,
            content.renderedText,
          );
          done();
        });
    });
    after(function (done) {
      helper.deleteTemplate(app, 'chanson', done);
    });
  });

  describe('get template', function () {
    before(function (done) {
      helper.createTemplate(app, 'basic_a', (sha1) => {
        done();
      });
    });
    it(`get template content`, function (done) {
      chai
        .request(app)
        .get(`/templates/basic_a`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          // console.log(content);
          assert(content.templateSha1 != null);
          assert.equal(content.templateContent.templateId, 'basic_a');
          assert(content.templateContent.comp != null);
          const contentSrc = content.templateContent.src;
          assert(contentSrc != null);
          assert.equal(contentSrc.entryTemplate, 'test.pug');
          assert(contentSrc.templates['test.pug'].indexOf('aaa') > -1);
          done();
        });
    });
    after(function (done) {
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });

  describe('multiple users', function () {
    describe('each user sees his templates', function () {
      before(function (done) {
        helper.createTemplateForUser(app, 'user1', 'basic_a', () => {
          helper.createTemplateForUser(app, 'user2', 'basic_b', () => {
            helper.createTemplateForUser(app, 'user1', 'chanson', done);
          });
        });
      });
      it('user1 should see 2 templates', function (done) {
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
      it('user2 should see 1 templates', function (done) {
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
      after(function (done) {
        helper.deleteTemplateForUser(app, 'user1', 'basic_a', () => {
          helper.deleteTemplateForUser(app, 'user1', 'chanson', () => {
            helper.deleteTemplateForUser(app, 'user2', 'basic_b', done);
          });
        });
      });
    });
    describe('invalid users', function () {
      it('invalid user list templates', function (done) {
        chai
          .request(app)
          .get('/templates')
          .set('X-RapidAPI-User', 'bla#')
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      it('invalid user deletes templates', function (done) {
        chai
          .request(app)
          .delete(`/templates/basic_a`)
          .set('X-RapidAPI-User', 'bla#')
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      it('invalid user creates a template', function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('X-RapidAPI-User', 'bla#')
          .set('content-type', 'application/json')
          .send(helper.getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      it('invalid user renders a template', function (done) {
        chai
          .request(app)
          .post(`/templates/basic_a/wedontcare/render`)
          .set('X-RapidAPI-User', 'bla#')
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      it('invalid user direct renders a template', function (done) {
        chai
          .request(app)
          .post(`/templates/render`)
          .set('X-RapidAPI-User', 'bla#')
          .set('content-type', 'application/json')
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
      it('invalid user gets a template', function (done) {
        chai
          .request(app)
          .get(`/templates/basic_a`)
          .set('X-RapidAPI-User', 'bla#')
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
    });
  });
});
