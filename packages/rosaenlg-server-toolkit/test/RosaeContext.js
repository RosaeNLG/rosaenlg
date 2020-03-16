const assert = require('assert');
const fs = require('fs');
const RosaeContext = require('../dist/RosaeContext').RosaeContext;
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompFr = require(`rosaenlg/dist/rollup/rosaenlg_tiny_fr_FR_${version}_comp`);
const compileFct = require('../dist/PackagedTemplate').compToPackagedTemplateComp;

describe('RosaeContext', function() {
  describe('nominal', function() {
    it(`can render`, function(done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
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

    it(`cannot render`, function(done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
        assert(rc);
        assert.throws(() => {
          const res = rc.render({
            bla: 'bla',
          });
        }, /cannot render/);
        done();
      });
    });

    it(`autotest fails because of expected`, function(done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawTemplate) => {
        const template = JSON.parse(rawTemplate);
        template.user = 'test';
        template.src.autotest.expected = ['Bbb'];
        assert.throws(() => {
          const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
          assert(rc);
        }, /autotest failed/);
        done();
      });
    });
  });

  it(`autotest fails because render fails`, function(done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.src.autotest.input.language = 'toto';
      assert.throws(() => {
        const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
        assert(rc);
      }, /cannot render autotest/);
      done();
    });
  });

  it(`no autotest`, function(done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.src.autotest.activate = false;
      const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
      assert(rc);
      done();
    });
  });

  it(`did not have to compile`, function(done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.comp = compileFct(template.src, rosaeNlgCompFr.compileFileClient, version, 'test');
      const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
      assert(!rc.hadToCompile);
      done();
    });
  });
  it(`was compiled but with another version`, function(done) {
    fs.readFile('test/templates/chanson.json', 'utf8', (_err, rawTemplate) => {
      const template = JSON.parse(rawTemplate);
      template.user = 'test';
      template.comp = compileFct(template.src, rosaeNlgCompFr.compileFileClient, 'SOME_VERSION', 'test');
      const rc = new RosaeContext(template, rosaeNlgCompFr, 'tests');
      assert(!rc.hadToCompile);
      done();
    });
  });
});
