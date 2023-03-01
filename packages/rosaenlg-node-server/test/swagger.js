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
const helper = require('./helper');

chai.use(chaiHttp);
chai.should();

describe('swagger', function () {
  before(function () {
    process.env.JWT_USE = true;
  });
  after(function () {
    helper.resetEnv();
  });

  let app;
  before(function () {
    app = new App([new TemplatesController(null)], 5010).server;
  });
  it('swagger content is ok', function (done) {
    chai
      .request(app)
      .get('/api-docs/')
      .end((err, res) => {
        res.should.have.status(200);
        // we cannot check real content
        assert(res.text.indexOf(`<title>Swagger UI</title>`) > -1);
        done();
      });
  });

  after(function () {
    app.close();
  });
});
