/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const App = require('../dist/app').App;
const TemplatesController = require('../dist/templates.controller').default;
const fs = require('fs');
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

let app;

const someExisting = {
  templateId: 'someExisting',
  type: 'existing',
  which: 'chanson',
};

describe('existing', function () {
  describe('nominal', function () {
    const sharedUser = 'shared';
    const testFolder = 'test-templates-persist-existing';

    before(function (done) {
      fs.mkdir(testFolder, () => {
        app = new App(
          [
            new TemplatesController({
              templatesPath: testFolder,
              userIdHeader: 'MyAuthHeader',
              sharedTemplatesUser: sharedUser,
            }),
          ],
          5000,
        ).server;
        done();
      });
    });
    after(function (done) {
      app.close(() => {
        fs.rmdir(testFolder, () => {
          helper.resetEnv();
          done();
        });
      });
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
          assert.strictEqual(content.ids.length, 0);
          done();
        });
    });

    describe('creating existing project', function () {
      before(function (done) {
        helper.createTemplateForUser(app, sharedUser, 'chanson', done);
      });
      it('create a template', function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('content-type', 'application/json')
          .send(someExisting)
          .end((err, res) => {
            res.should.have.status(201);
            res.body.should.be.a('object');
            const content = res.body;
            assert.strictEqual(content.templateId, 'someExisting');
            assert(content.templateSha1);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'someExisting', () => {
          helper.deleteTemplateForUser(app, sharedUser, 'chanson', done);
        });
      });
    });

    describe('list should contain a created project', function () {
      before(function (done) {
        helper.createTemplateForUser(app, sharedUser, 'chanson', () => {
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(someExisting)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
      });
      it('someExisting should be in the list', function (done) {
        chai
          .request(app)
          .get('/templates')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            assert.strictEqual(content.ids.length, 1);
            assert.strictEqual(content.ids[0], 'someExisting');
            done();
          });
      });

      after(function (done) {
        helper.deleteTemplate(app, 'someExisting', () => {
          helper.deleteTemplateForUser(app, sharedUser, 'chanson', done);
        });
      });
    });

    describe('render must work', function () {
      before(function (done) {
        helper.createTemplateForUser(app, sharedUser, 'chanson', () => {
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(someExisting)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
      });
      it('render', function (done) {
        chai
          .request(app)
          .post(`/templates/someExisting/someSha1/render`)
          .set('content-type', 'application/json')
          .send({
            language: 'fr_FR',
            chanson: {
              auteur: 'Ludan Piaffe',
              nom: 'Non, je ne regrette rien',
            },
          })
          .end((err, res) => {
            // console.log(res);
            res.should.have.status(200);
            assert(!err);
            assert(res.text);
            assert(res.text.indexOf('Ludan Piaffe') > -1);

            done();
          });
      });
      after(function (done) {
        helper.deleteTemplate(app, 'someExisting', () => {
          helper.deleteTemplateForUser(app, sharedUser, 'chanson', done);
        });
      });
    });

    describe('delete', function () {
      describe('just delete', function () {
        before(function (done) {
          helper.createTemplateForUser(app, sharedUser, 'chanson', () => {
            chai
              .request(app)
              .post('/templates')
              .set('content-type', 'application/json')
              .send(someExisting)
              .end((err, res) => {
                res.should.have.status(201);
                done();
              });
          });
        });
        after(function (done) {
          helper.deleteTemplateForUser(app, sharedUser, 'chanson', done);
        });

        it('delete should work', function (done) {
          chai
            .request(app)
            .delete(`/templates/someExisting`)
            .end((err, res) => {
              res.should.have.status(204);
              done();
            });
        });
      });
      describe('check empty list after delete', function () {
        before(function (done) {
          helper.createTemplateForUser(app, sharedUser, 'chanson', () => {
            chai
              .request(app)
              .post('/templates')
              .set('content-type', 'application/json')
              .send(someExisting)
              .end((err, res) => {
                res.should.have.status(201);
                chai
                  .request(app)
                  .delete(`/templates/someExisting`)
                  .end((err, res) => {
                    res.should.have.status(204);
                    done();
                  });
              });
          });
        });
        after(function (done) {
          helper.deleteTemplateForUser(app, sharedUser, 'chanson', done);
        });

        it('should be empty', function (done) {
          chai
            .request(app)
            .get('/templates')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              const content = res.body;
              assert.strictEqual(content.ids.length, 0);
              done();
            });
        });
      });
    });

    describe('get template', function () {
      before(function (done) {
        helper.createTemplateForUser(app, sharedUser, 'chanson', () => {
          chai
            .request(app)
            .post('/templates')
            .set('content-type', 'application/json')
            .send(someExisting)
            .end((err, res) => {
              res.should.have.status(201);
              done();
            });
        });
      });
      it(`get template content`, function (done) {
        chai
          .request(app)
          .get(`/templates/someExisting`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            // console.log(content);
            assert.strictEqual(content.templateContent.templateId, 'someExisting');
            assert.strictEqual(content.templateContent.which, 'chanson');
            assert(!content.templateContent.src);
            assert(!content.templateContent.comp);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplateForUser(app, sharedUser, 'chanson', () => {
          helper.deleteTemplate(app, 'someExisting', done);
        });
      });
    });
  });
  describe('with dedicated folder', function () {
    const sharedUser = 'shared';
    const sharedFolder = 'test-shared';
    const testFolder = 'test-templates-persist-existing-sf';

    before(function (done) {
      fs.mkdir(sharedFolder, () => {
        fs.copyFile('test-templates-repo/chanson.json', sharedFolder + '/shared#chanson.json', () => {
          fs.mkdir(testFolder, () => {
            app = new App(
              [
                new TemplatesController({
                  templatesPath: testFolder,
                  userIdHeader: 'MyAuthHeader',
                  sharedTemplatesUser: sharedUser,
                  sharedTemplatesPath: sharedFolder,
                }),
              ],
              5000,
            ).server;
            done();
          });
        });
      });
    });
    after(function (done) {
      app.close(() => {
        fs.unlink(sharedFolder + '/shared#chanson.json', () => {
          fs.rmdir(sharedFolder, () => {
            fs.rmdir(testFolder, () => {
              helper.resetEnv();
              done();
            });
          });
        });
      });
    });

    it('initial template list must be empty', function (done) {
      chai
        .request(app)
        .get('/templates')
        .set('MyAuthHeader', 'toto')
        .end((_err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          const content = res.body;
          assert(content.ids);
          assert.strictEqual(content.ids.length, 0);
          done();
        });
    });

    describe('render must work', function () {
      before(function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('MyAuthHeader', 'toto')
          .set('content-type', 'application/json')
          .send(someExisting)
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
      it('render', function (done) {
        chai
          .request(app)
          .post(`/templates/someExisting/someSha1/render`)
          .set('MyAuthHeader', 'toto')
          .set('content-type', 'application/json')
          .send({
            language: 'fr_FR',
            chanson: {
              auteur: 'Ludan Piaffe',
              nom: 'Non, je ne regrette rien',
            },
          })
          .end((err, res) => {
            // console.log(res);
            res.should.have.status(200);
            assert(!err);
            assert(res.text);
            assert(res.text.indexOf('Ludan Piaffe') > -1);

            done();
          });
      });
      after(function (done) {
        helper.deleteTemplateForUser(app, 'toto', 'someExisting', done);
      });
    });

    describe('get template', function () {
      before(function (done) {
        chai
          .request(app)
          .post('/templates')
          .set('MyAuthHeader', 'toto')
          .set('content-type', 'application/json')
          .send(someExisting)
          .end((err, res) => {
            res.should.have.status(201);
            done();
          });
      });
      it(`get template content`, function (done) {
        chai
          .request(app)
          .get(`/templates/someExisting`)
          .set('MyAuthHeader', 'toto')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            const content = res.body;
            // console.log(content);
            assert.strictEqual(content.templateContent.templateId, 'someExisting');
            assert.strictEqual(content.templateContent.which, 'chanson');
            assert(!content.templateContent.src);
            assert(!content.templateContent.comp);
            done();
          });
      });
      after(function (done) {
        helper.deleteTemplateForUser(app, 'toto', 'someExisting', done);
      });
    });
  });
});
