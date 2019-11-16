const assert = require('assert');
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').default;
const TemplatesController = require('../dist/templates.controller').default;

chai.use(chaiHttp);
chai.should();

function assertTemplatesList(app, contains) {
  if (!contains) {
    contains = [];
  }
  it(`template list should have ${contains.length} elts: ${contains}`, function(done) {
    chai
      .request(app)
      .get('/templates')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.ids);
        assert(content.ids.length == contains.length);
        for (let i = 0; i < contains.length; i++) {
          assert(content.ids.indexOf(contains[i]) > -1);
        }
        done();
      });
  });
}

function getTestTemplate(templateId) {
  return fs.readFileSync(`test-templates-repo/${templateId}.json`, 'utf8');
}

function pushTemplate(app, params) {
  const templateId = params.templateId;
  if (!params.method) {
    params.method = 'put';
  }
  if (!params.template) {
    params.template = getTestTemplate(templateId);
  }
  it(`creating template ${templateId} should be ok`, function(done) {
    chai
      .request(app)
      [params.method]('/templates')
      .set('content-type', 'application/json')
      .send(params.template)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.templateId == templateId);
        if (!params.status) {
          params.status = 'CREATED';
        }
        assert(content.status == params.status);
        done();
      });
  });
}

function renderTemplate(app, templateId, opts, expected) {
  it(`rendering ${templateId} with expected: ${expected}`, function(done) {
    chai
      .request(app)
      .post(`/templates/${templateId}/render`)
      .set('content-type', 'application/json')
      .send(opts)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.templateId == templateId);
        assert(content.renderOptions.language != null);
        assert(content.counter != null);

        for (let i = 0; i < expected.length; i++) {
          assert(
            content.renderedText.indexOf(expected[i]) > -1,
            `expected: ${expected[i]}, content: ${content.renderedText}`,
          );
        }

        done();
      });
  });
}

function deleteTemplate(app, templateId) {
  it(`delete template ${templateId}`, function(done) {
    chai
      .request(app)
      .delete(`/templates/${templateId}`)
      .end((err, res) => {
        res.should.have.status(200);
        done();
      });
  });
}

function confirmNoRender(app, templateId, opts) {
  it(`confirm rendering ${templateId} will fail`, function(done) {
    chai
      .request(app)
      .post(`/templates/${templateId}/render`)
      .set('content-type', 'application/json')
      .send(opts)
      .end((err, res) => {
        res.should.not.have.status(200);
        done();
      });
  });
}

describe('node-server', function() {
  describe('no templates path', function() {
    const appNoTemplates = new App([new TemplatesController(null)], 5000).server;

    describe('basic cycle with post', function() {
      assertTemplatesList(appNoTemplates);
      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        status: 'CREATED',
        method: 'post',
      });
      assertTemplatesList(appNoTemplates, ['basic_a']);
      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      deleteTemplate(appNoTemplates, 'basic_a');
      assertTemplatesList(appNoTemplates);
    });
    describe('create and delete cycle', function() {
      assertTemplatesList(appNoTemplates);
      pushTemplate(appNoTemplates, { templateId: 'basic_a' });
      assertTemplatesList(appNoTemplates, ['basic_a']);
      deleteTemplate(appNoTemplates, 'basic_a');
      assertTemplatesList(appNoTemplates);
      confirmNoRender(appNoTemplates, 'basic_a', { language: 'en_US' });
      confirmNoRender(appNoTemplates, 'basic_b', { language: 'en_US' });
    });
    describe('test idempotent', function() {
      assertTemplatesList(appNoTemplates);
      pushTemplate(appNoTemplates, { templateId: 'basic_a' });
      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        status: 'UPDATED',
      });
      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        status: 'UPDATED',
      });
      assertTemplatesList(appNoTemplates, ['basic_a']);
      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      deleteTemplate(appNoTemplates, 'basic_a');
      assertTemplatesList(appNoTemplates);
      confirmNoRender(appNoTemplates, 'basic_a', { language: 'en_US' });
    });
    describe('create from scratch', function() {
      assertTemplatesList(appNoTemplates);
      pushTemplate(appNoTemplates, { templateId: 'basic_a' });
      assertTemplatesList(appNoTemplates, ['basic_a']);

      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);

      pushTemplate(appNoTemplates, { templateId: 'basic_b' });
      assertTemplatesList(appNoTemplates, ['basic_a', 'basic_b']);

      deleteTemplate(appNoTemplates, 'basic_a');
      assertTemplatesList(appNoTemplates, ['basic_b']);
      deleteTemplate(appNoTemplates, 'basic_b');
    });
    describe('render with params', function() {
      assertTemplatesList(appNoTemplates);
      pushTemplate(appNoTemplates, { templateId: 'chanson' });
      assertTemplatesList(appNoTemplates, ['chanson']);

      renderTemplate(
        appNoTemplates,
        'chanson',
        {
          language: 'fr_FR',
          chanson: {
            auteur: 'Édith Piaf',
            nom: 'Non, je ne regrette rien',
          },
        },
        [`Il chantera "Non, je ne regrette rien" d'Édith Piaf`],
      );
      deleteTemplate(appNoTemplates, 'chanson');
    });
    describe('test update', function() {
      assertTemplatesList(appNoTemplates);

      const templateOriginal = getTestTemplate('basic_a');
      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        template: templateOriginal,
      });

      assertTemplatesList(appNoTemplates, ['basic_a']);
      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);

      const templateModified = templateOriginal.replace('aaa', 'ccc').replace('Aaa', 'Ccc');

      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        template: templateModified,
        status: 'UPDATED',
      });

      assertTemplatesList(appNoTemplates, ['basic_a']);
      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Ccc']);

      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        template: templateOriginal,
        status: 'UPDATED',
      });

      assertTemplatesList(appNoTemplates, ['basic_a']);
      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);

      deleteTemplate(appNoTemplates, 'basic_a');
    });

    describe('get template', function() {
      const templateId = 'basic_a';
      pushTemplate(appNoTemplates, { templateId: templateId });

      it(`get template content ${templateId}`, function(done) {
        chai
          .request(appNoTemplates)
          .get(`/templates/${templateId}/template`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert(content.templateId == templateId);
            assert(content.entryTemplate == 'test.pug');
            assert(content.templates['test.pug'].indexOf('aaa') > -1);
            done();
          });
      });
      deleteTemplate(appNoTemplates, templateId);
    });

    describe('edge case', function() {
      describe(`reload must fail`, function() {
        assertTemplatesList(appNoTemplates);
        pushTemplate(appNoTemplates, { templateId: 'basic_a' });
        it(`reload 1 template fails`, function(done) {
          chai
            .request(appNoTemplates)
            .get(`/templates/basic_a/reload`)
            .end((err, res) => {
              res.should.have.status(500);
              done();
            });
        });
        it(`reload all template fails`, function(done) {
          chai
            .request(appNoTemplates)
            .get(`/templates/reload`)
            .end((err, res) => {
              res.should.have.status(500);
              done();
            });
        });
        deleteTemplate(appNoTemplates, 'basic_a');
      });
      describe(`delete on template that does not exist`, function() {
        assertTemplatesList(appNoTemplates);
        it(`do it`, function(done) {
          chai
            .request(appNoTemplates)
            .delete(`/templates/blabla`)
            .end((err, res) => {
              res.should.have.status(500);
              done();
            });
        });
      });
      describe(`get on template that does not exist`, function() {
        assertTemplatesList(appNoTemplates);
        it(`do it`, function(done) {
          chai
            .request(appNoTemplates)
            .get(`/templates/blabla/template`)
            .end((err, res) => {
              res.should.have.status(500);
              done();
            });
        });
      });

      describe(`render err`, function() {
        assertTemplatesList(appNoTemplates);
        pushTemplate(appNoTemplates, { templateId: 'chanson' });
        assertTemplatesList(appNoTemplates, ['chanson']);
        it(`render err`, function(done) {
          chai
            .request(appNoTemplates)
            .post(`/templates/chanson/render`)
            .set('content-type', 'application/json')
            .send({
              language: 'fr_FR',
            })
            .end((err, res) => {
              res.should.have.status(500);
              const content = res.text;
              assert(content.indexOf(`Cannot read property 'nom' of undefined`) > -1);
              done();
            });
        });

        deleteTemplate(appNoTemplates, 'chanson');
      });
      describe(`create template with no ID`, function() {
        const parsedTemplate = JSON.parse(getTestTemplate('basic_a'));
        delete parsedTemplate.templateId;
        it(`creating template should fail`, function(done) {
          chai
            .request(appNoTemplates)
            .put('/templates')
            .set('content-type', 'application/json')
            .send(JSON.stringify(parsedTemplate))
            .end((err, res) => {
              res.should.have.status(500);
              assert(res.text.indexOf('templateId') > -1);
              done();
            });
        });
      });
      describe('wrong autotest: not able to render', function() {
        const parsedTemplate = JSON.parse(getTestTemplate('chanson'));
        delete parsedTemplate.autotest.input.chanson;
        it(`creating template should fail`, function(done) {
          chai
            .request(appNoTemplates)
            .put('/templates')
            .set('content-type', 'application/json')
            .send(JSON.stringify(parsedTemplate))
            .end((err, res) => {
              res.should.have.status(500);
              assert(res.text.indexOf('cannot render autotest') > -1);
              done();
            });
        });
      });
      describe('wrong autotest: rendered content not ok', function() {
        const parsedTemplate = JSON.parse(getTestTemplate('chanson'));
        parsedTemplate.autotest.expected = ['bla bla bla'];
        // console.log(JSON.stringify(parsedTemplate));
        it(`creating template should fail`, function(done) {
          chai
            .request(appNoTemplates)
            .put('/templates')
            .set('content-type', 'application/json')
            .send(JSON.stringify(parsedTemplate))
            .end((err, res) => {
              res.should.have.status(500);
              assert(res.text.indexOf('failed') > -1, res.text);
              assert(res.text.indexOf('rendered') > -1, res.text);
              done();
            });
        });
      });
      describe('cannot compile template', function() {
        const parsedTemplate = JSON.parse(getTestTemplate('chanson'));
        parsedTemplate.templates['chanson.pug'] = 'include blabla';
        it(`creating template should fail`, function(done) {
          chai
            .request(appNoTemplates)
            .put('/templates')
            .set('content-type', 'application/json')
            .send(JSON.stringify(parsedTemplate))
            .end((err, res) => {
              res.should.have.status(500);
              // console.log(res.text);
              assert(res.text.indexOf('cannot compile') > -1, res.text);
              done();
            });
        });
      });
      describe('no autotest', function() {
        const parsedTemplate = JSON.parse(getTestTemplate('basic_a'));
        delete parsedTemplate.autotest;
        it(`creating template should be ok`, function(done) {
          chai
            .request(appNoTemplates)
            .put('/templates')
            .set('content-type', 'application/json')
            .send(JSON.stringify(parsedTemplate))
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
        deleteTemplate(appNoTemplates, 'basic_a');
      });
    });

    describe('multiple templates at the same time', function() {
      pushTemplate(appNoTemplates, {
        templateId: 'basic_a',
        status: 'CREATED',
      });
      pushTemplate(appNoTemplates, {
        templateId: 'basic_b',
        status: 'CREATED',
      });
      pushTemplate(appNoTemplates, {
        templateId: 'chanson',
        status: 'CREATED',
      });
      assertTemplatesList(appNoTemplates, ['basic_a', 'basic_b', 'chanson']);

      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      renderTemplate(appNoTemplates, 'basic_b', { language: 'en_US' }, ['Bbb']);
      renderTemplate(
        appNoTemplates,
        'chanson',
        {
          language: 'fr_FR',
          chanson: {
            auteur: 'Édith Piaf',
            nom: 'Non, je ne regrette rien',
          },
        },
        [`Il chantera "Non, je ne regrette rien" d'Édith Piaf`],
      );

      deleteTemplate(appNoTemplates, 'chanson');

      renderTemplate(appNoTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      renderTemplate(appNoTemplates, 'basic_b', { language: 'en_US' }, ['Bbb']);

      deleteTemplate(appNoTemplates, 'basic_a');
      deleteTemplate(appNoTemplates, 'basic_b');

      assertTemplatesList(appNoTemplates);
    });

    describe('check swagger', function() {
      it('swagger content is ok', function(done) {
        chai
          .request(appNoTemplates)
          .get('/api-docs/')
          .end((err, res) => {
            res.should.have.status(200);
            // we cannot check real content
            assert(res.text.indexOf(`<title>Swagger UI</title>`) > -1);
            done();
          });
      });
    });

    // closing this server
    appNoTemplates.close();
  });

  describe('with templates path', function() {
    const testFolder = 'test-templates-testing';

    process.env.ROSAENLG_HOMEDIR = testFolder;
    const appTemplates = new App([new TemplatesController(process.env.ROSAENLG_HOMEDIR)], 5000).server;

    describe('file is saved', function() {
      pushTemplate(appTemplates, {
        templateId: 'basic_a',
        status: 'CREATED',
      });
      it(`file should be here`, function() {
        assert(fs.existsSync(`${testFolder}/basic_a.json`));
      });
      deleteTemplate(appTemplates, 'basic_a');
      it(`file should not be here`, function() {
        assert(!fs.existsSync(`${testFolder}/basic_a.json`));
      });
    });

    describe('create render delete cycle', function() {
      pushTemplate(appTemplates, {
        templateId: 'basic_a',
        status: 'CREATED',
      });
      renderTemplate(appTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      it(`file should be here`, function() {
        assert(fs.existsSync(`${testFolder}/basic_a.json`));
      });
      deleteTemplate(appTemplates, 'basic_a');
      it(`file should not be here`, function() {
        assert(!fs.existsSync(`${testFolder}/basic_a.json`));
      });
    });

    describe('reload', function() {
      pushTemplate(appTemplates, {
        templateId: 'basic_a',
        status: 'CREATED',
      });
      renderTemplate(appTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);
      it(`file should be here`, function(done) {
        assert(fs.existsSync(`${testFolder}/basic_a.json`));
        done();
      });

      it('blabla', function() {
        const originalTemplate = fs.readFileSync(`${testFolder}/basic_a.json`, 'utf8');
        const changedTemplate = originalTemplate.replace('aaa', 'bbb').replace('Aaa', 'Bbb');
        // console.log(changedTemplate);
        fs.writeFileSync(`${testFolder}/basic_a.json`, changedTemplate, 'utf8');
      });

      renderTemplate(appTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);

      it(`reload should work`, function() {
        chai
          .request(appTemplates)
          .get(`/templates/basic_a/reload`)
          .end((err, res) => {
            res.should.have.status(200);
            // done();
          });
      });

      // changed
      renderTemplate(appTemplates, 'basic_a', { language: 'en_US' }, ['Bbb']);

      // reload all
      it(`reload all should work`, function(done) {
        // put the original again
        fs.writeFileSync(`${testFolder}/basic_a.json`, getTestTemplate('basic_a'), 'utf8');
        chai
          .request(appTemplates)
          .get(`/templates/reload`)
          .end((err, res) => {
            res.should.have.status(200);
            done();
          });
      });

      // back to original
      renderTemplate(appTemplates, 'basic_a', { language: 'en_US' }, ['Aaa']);

      deleteTemplate(appTemplates, 'basic_a');
      it(`file should not be here`, function() {
        assert(!fs.existsSync(`${testFolder}/basic_a.json`));
      });
    });

    describe('edge cases', function() {
      describe('reload on template that does not exist', function() {
        it(`reload should not work`, function(done) {
          chai
            .request(appTemplates)
            .get(`/templates/xxxxxxx/reload`)
            .end((err, res) => {
              res.should.have.status(500);
              assert(res.text.indexOf('not read file') > -1, res.text);
              done();
            });
        });
      });

      describe('invalid template on disk', function() {
        const parsedTemplate = JSON.parse(getTestTemplate('chanson'));
        parsedTemplate.templates['chanson.pug'] = 'include blabla';
        fs.writeFileSync(`${testFolder}/chanson.json`, JSON.stringify(parsedTemplate), 'utf8');
        it(`reload should not work`, function(done) {
          chai
            .request(appTemplates)
            .get(`/templates/chanson/reload`)
            .end((err, res) => {
              res.should.have.status(500);
              assert(res.text.indexOf('could not load template') > -1, res.text);
              done();
            });
        });
        deleteTemplate(appTemplates, 'chanson');
      });
    });

    // closing this server
    appTemplates.close();
  });

  describe('wrong templates path', function() {
    const appWrongPath = new App([new TemplatesController('blablabla')], 5000).server;

    describe('create template should fail', function() {
      it(`creating template should be ok`, function(done) {
        chai
          .request(appWrongPath)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(getTestTemplate('basic_a'))
          .end((err, res) => {
            res.should.have.status(500);
            done();
          });
      });
    });

    // closing this server
    appWrongPath.close();
  });
});
