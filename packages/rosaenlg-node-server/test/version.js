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

// console.log(helper);

chai.use(chaiHttp);
chai.should();

describe('version', function () {
  let app;
  before(function () {
    app = new App([new TemplatesController(null)], 5010).server;
    process.env.JWT_USE = false;
  });
  it('basic', function (done) {
    chai
      .request(app)
      .get('/version')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const content = res.body;
        assert(content.version);
        assert(/[0-9]+\.[0-9]+\.[0-9]+/.test(content.version), content.version);
        done();
      });
  });
  after(function () {
    app.close();
    helper.resetEnv();
  });
});
