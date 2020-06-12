const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

const testFolder = 'test-templates-auth';

chai.use(chaiHttp);
chai.should();

let app;

describe('auth', function () {
  before(function () {
    process.env.JWT_USE = true;
    process.env.JWT_ISSUER = 'https://someissuer.auth0.com/';
    process.env.JWT_JWKS_URI = 'https://someissuer.eu.auth0.com/.well-known/jwks.json';
    process.env.JWT_AUDIENCE = 'https://someurl.org';
    process.env.ROSAENLG_HOMEDIR = testFolder;
    app = new App([new TemplatesController(null)], 5000).server;
  });
  after(function () {
    app.close();
    helper.resetEnv();
  });

  it('will 401', function (done) {
    chai
      .request(app)
      .get('/templates')
      .end((_err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  /*
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
          done();
        });
    });
    after(function (done) {
      helper.deleteTemplate(app, 'basic_a', done);
    });
  });
  */
});
