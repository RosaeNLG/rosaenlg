const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

// console.log(helper);

chai.use(chaiHttp);
chai.should();

let app;

describe('basic', function() {
  before(function() {
    app = new App([new TemplatesController(null)], 5000).server;
  });
  after(function() {
    app.close();
  });

  it('initial template list must be empty', function(done) {
    chai
      .request(app)
      .get('/templates')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.ids);
        assert.equal(content.ids.length, 0);
        done();
      });
  });

  describe('creating template', function() {
    describe('with post', function() {
      it('create a template', function(done) {
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
            assert.equal(content.status, 'CREATED');
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
    describe('with put', function() {
      it('create a template', function(done) {
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
            assert.equal(content.status, 'CREATED');
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
  });

  describe('list should contain a created template', function() {
    before(function(done) {
      helper.createTemplate(app, 'basic_a', done);
    });
    it('basic_a should be in the list', function(done) {
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

    after(function(done) {
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });

  describe('render', function() {
    before(function(done) {
      helper.createTemplate(app, 'basic_a', done);
    });
    it('render', function(done) {
      chai
        .request(app)
        .post(`/templates/basic_a/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal('basic_a', content.templateId);
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
    describe('just delete', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', done);
      });
      it('delete should work', function(done) {
        chai
          .request(app)
          .delete(`/templates/basic_a`)
          .end((err, res) => {
            res.should.have.status(204);
            done();
          });
      });
    });
    describe('check empty list after delete', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', function() {
          helper.deleteTemplate(app, 'basic_a', done);
        });
      });
      it('should be empty', function(done) {
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
    describe('check cannot render after delete', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', function() {
          helper.deleteTemplate(app, 'basic_a', done);
        });
      });
      it('cannot render', function(done) {
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

  describe('update template', function() {
    describe('just update with same content', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', done);
      });
      it('update', function(done) {
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
            assert.equal(content.status, 'UPDATED');
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('render after update', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', function() {
          helper.createTemplate(app, 'basic_a', done);
        });
      });
      it('update', function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.equal('basic_a', content.templateId);
            assert('en_US', content.renderOptions.language);
            assert(content.renderedText.indexOf('Aaa') > -1, content.renderedText);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });

    describe('real update with content change', function() {
      before(function(done) {
        helper.createTemplate(app, 'basic_a', function() {
          const templateOriginal = helper.getTestTemplate('basic_a');
          const templateModified = templateOriginal.replace('aaa', 'ccc').replace('Aaa', 'Ccc');
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(templateModified)
            .end((err, res) => {
              done();
            });
        });
      });
      it('test render on updated template', function(done) {
        chai
          .request(app)
          .post(`/templates/basic_a/render`)
          .set('content-type', 'application/json')
          .send({ language: 'en_US' })
          .end((err, res) => {
            res.should.have.status(200);
            const content = res.body;
            assert(content.renderedText.indexOf('Ccc') > -1, content.renderedText);
            done();
          });
      });
      after(function(done) {
        helper.deleteTemplate(app, 'basic_a', done);
      });
    });
  });

  describe('multiple templates', function() {
    beforeEach(function(done) {
      helper.createTemplate(app, 'basic_a', () => {
        helper.createTemplate(app, 'basic_b', () => {
          helper.createTemplate(app, 'chanson', done);
        });
      });
    });
    it(`3 elements in the list`, function(done) {
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
    it(`second template renders well`, function(done) {
      chai
        .request(app)
        .post(`/templates/basic_b/render`)
        .set('content-type', 'application/json')
        .send({ language: 'en_US' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal('basic_b', content.templateId);
          assert('en_US', content.renderOptions.language);
          assert(content.renderedText.indexOf('Bbb') > -1, content.renderedText);
          done();
        });
    });
    it(`last template renders well`, function(done) {
      chai
        .request(app)
        .post(`/templates/chanson/render`)
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
    afterEach(function(done) {
      helper.deleteTemplate(app, 'basic_a', () => {
        helper.deleteTemplate(app, 'basic_b', () => {
          helper.deleteTemplate(app, 'chanson', done);
        });
      });
    });
  });

  describe('render with params', function() {
    before(function(done) {
      helper.createTemplate(app, 'chanson', done);
    });
    it(`should render`, function(done) {
      chai
        .request(app)
        .post(`/templates/chanson/render`)
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
    after(function(done) {
      helper.deleteTemplate(app, 'chanson', done);
    });
  });

  describe('get template', function() {
    before(function(done) {
      helper.createTemplate(app, 'basic_a', done);
    });
    it(`get template content`, function(done) {
      chai
        .request(app)
        .get(`/templates/basic_a`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert.equal(content.templateId, 'basic_a');
          assert.equal(content.entryTemplate, 'test.pug');
          assert(content.templates['test.pug'].indexOf('aaa') > -1);
          done();
        });
    });
    after(function(done) {
      helper.deleteTemplate(app, 'chanson', done);
    });
  });
});
