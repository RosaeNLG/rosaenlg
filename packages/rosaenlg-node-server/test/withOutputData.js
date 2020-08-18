const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

let app;

describe('with output data', function () {
  before(function () {
    app = new App(
      [
        new TemplatesController({
          userIdHeader: 'MyAuthHeader',
        }),
      ],
      5000,
    ).server;
  });
  after(function () {
    app.close();
    helper.resetEnv();
  });

  describe('render', function () {
    let templateSha1;
    before(function (done) {
      helper.createTemplate(app, 'outputdata', (sha1) => {
        templateSha1 = sha1;
        done();
      });
    });
    it('render', function (done) {
      chai
        .request(app)
        .post(`/templates/outputdata/${templateSha1}/render`)
        .set('content-type', 'application/json')
        .send({
          language: 'fr_FR',
          input: {
            field: 1,
          },
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert('en_US', content.renderOptions.language);
          assert(content.renderedText.indexOf('Bla') > -1, content.renderedText);
          assert.equal(content.templateSha1, templateSha1);
          assert(content.outputData);
          assert.deepEqual(content.outputData, { foo: 'bar', val: 2, obj: { aaa: 'bbb' } });
          done();
        });
    });
    after(function (done) {
      helper.deleteTemplate(app, 'outputdata', done);
    });
  });
});
