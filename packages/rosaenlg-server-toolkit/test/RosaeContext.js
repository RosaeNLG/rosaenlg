/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const fs = require('fs');
const RosaeContext = require('../dist/RosaeContext').RosaeContext;
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompFr = require(`rosaenlg/dist/rollup/rosaenlg_tiny_fr_FR_${version}_comp`);
const completePackagedTemplateJson = require('rosaenlg-packager').completePackagedTemplateJson;

describe('RosaeContext', function () {
  describe('nominal', function () {
    it(`can render`, function (done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        const rc = new RosaeContext(template, rosaeNlgCompFr);
        assert(!err);
        assert(rc);
        const res = rc.render({
          language: 'fr_FR',
          chanson: {
            auteur: 'Ludan Piaffe',
            nom: 'Non, je ne regrette rien',
          },
        });
        assert(res.text);
        assert(res.text.indexOf('Ludan Piaffe') > -1);
        done();
      });
    });

    it(`check render options in the output`, function (done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        template.src.compileInfo.compileDebug = true;
        const rc = new RosaeContext(template, rosaeNlgCompFr);
        assert(!err);
        assert(rc);
        const res = rc.render({
          language: 'fr_FR',
          renderDebug: true,
          forceRandomSeed: 42,
          chanson: {
            auteur: 'Ludan Piaffe',
            nom: 'Non, je ne regrette rien',
          },
        });
        assert(res.text);
        assert(res.text.indexOf('Ludan Piaffe') > -1);
        assert(res.text.indexOf('rosaenlg-debug') > -1);
        console.log(res.renderOptions);
        assert.strictEqual(res.renderOptions.renderDebug, true);
        assert.strictEqual(res.renderOptions.forceRandomSeed, 42);
        assert.strictEqual(res.renderOptions.randomSeed, 42);
        done();
      });
    });

    it(`with output data`, function (done) {
      fs.readFile('test/templates/outputdata.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        const rc = new RosaeContext(template, rosaeNlgCompFr);
        assert(!err);
        assert(rc);
        const res = rc.render({
          language: 'fr_FR',
          input: {
            field: 1,
          },
        });
        assert(res.text);
        assert(res.text.indexOf('Bla') > -1);
        assert(res.outputData);
        assert.deepStrictEqual(res.outputData, { foo: 'bar', val: 2, obj: { aaa: 'bbb' } });
        done();
      });
    });

    it(`cannot render`, function (done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        const rc = new RosaeContext(template, rosaeNlgCompFr);
        assert(rc);
        assert.throws(() => {
          rc.render({
            bla: 'bla',
          });
        }, /cannot render/);
        done();
      });
    });

    it(`autotest fails because of expected`, function (done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        template.src.autotest.expected = ['Bbb'];
        assert.throws(() => {
          const rc = new RosaeContext(template, rosaeNlgCompFr);
          assert(rc);
        }, /autotest failed/);
        done();
      });
    });
  });

  it(`autotest fails because render fails`, function (done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.src.autotest.input.language = 'toto';
      assert.throws(() => {
        const rc = new RosaeContext(template, rosaeNlgCompFr);
        assert(rc);
      }, /cannot render autotest/);
      done();
    });
  });

  it(`no autotest`, function (done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.src.autotest.activate = false;
      const rc = new RosaeContext(template, rosaeNlgCompFr);
      assert(rc);
      done();
    });
  });

  it(`did not have to compile`, function (done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.src.compileInfo.activate = true;
      completePackagedTemplateJson(template, rosaeNlgCompFr);

      const rc = new RosaeContext(template, rosaeNlgCompFr);
      assert(!rc.hadToCompile);
      done();
    });
  });
  it(`was compiled but with another version`, function (done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';

      template.src.compileInfo.activate = true;
      completePackagedTemplateJson(template, rosaeNlgCompFr);
      template.comp.compiledWithVersion = 'TOTO';

      const rc = new RosaeContext(template, rosaeNlgCompFr);
      assert(!rc.hadToCompile);
      done();
    });
  });

  it(`was not compiled and no compiler`, function (done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';

      assert.throws(() => {
        new RosaeContext(template, null);
      }, /no compiler found/);

      done();
    });
  });
});
