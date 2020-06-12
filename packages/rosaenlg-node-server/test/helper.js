const chai = require('chai');
const fs = require('fs');

exports.resetEnv = () => {
  process.env.JWT_USE = '';
  process.env.JWT_ISSUER = '';
  process.env.JWT_JWKS_URI = '';
  process.env.JWT_AUDIENCE = '';
  process.env.ROSAENLG_HOMEDIR = '';
};

exports.getTestTemplate = (templateId) => {
  return fs.readFileSync(`test-templates-repo/${templateId}.json`, 'utf8');
};

exports.deleteTemplate = (app, templateId, done) => {
  chai
    .request(app)
    .delete(`/templates/${templateId}`)
    .end((err, res) => {
      done();
    });
};

exports.deleteTemplateForUser = (app, userId, templateId, done) => {
  chai
    .request(app)
    .delete(`/templates/${templateId}`)
    .set('X-RapidAPI-User', userId)
    .end((err, res) => {
      done();
    });
};

exports.createTemplate = (app, templateId, done) => {
  chai
    .request(app)
    .post('/templates')
    .set('content-type', 'application/json')
    .send(exports.getTestTemplate(templateId))
    .end((err, res) => {
      const content = res.body;
      done(content.templateSha1);
    });
};

exports.createTemplateForUser = (app, userId, templateId, done) => {
  chai
    .request(app)
    .post('/templates')
    .set('content-type', 'application/json')
    .set('X-RapidAPI-User', userId)
    .send(exports.getTestTemplate(templateId))
    .end((err, res) => {
      done();
    });
};
