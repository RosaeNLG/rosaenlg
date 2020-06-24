const assert = require('assert');
const fs = require('fs');
const MemoryRosaeContextsManager = require('../dist/MemoryRosaeContextsManager').MemoryRosaeContextsManager;
const RosaeContext = require('../dist/RosaeContext').RosaeContext;
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompUs = require(`rosaenlg/dist/rollup/rosaenlg_tiny_en_US_${version}_comp`);

describe('MemoryRosaeContextsManager', function () {
  describe('nominal', function () {
    let cm = null;
    before(function (done) {
      cm = new MemoryRosaeContextsManager(rosaeNlgCompUs, {});
      done();
    });

    describe('nominal', function () {
      it(`has no backend`, function () {
        assert(!cm.hasBackend());
      });

      it(`is healthy`, function (done) {
        cm.checkHealth((err) => {
          assert(!err);
          done();
        });
      });

      it(`it has version`, function () {
        const apiVersion = cm.getVersion();
        assert(apiVersion);
        assert(/[0-9]+\.[0-9]+\.[0-9]+/.test(apiVersion), apiVersion);
        // console.log(`version with API: ${apiVersion}, current version: ${version}`);
        assert.equal(apiVersion, version);
      });

      it('getFilename', function () {
        assert.throws(() => cm.getFilename('test', 'toto'), /getFilename/);
      });

      it(`deleteFromCacheAndBackend`, function (done) {
        cm.setInCache('test', 'templateId', { templateSha1: 'somesha1', rosaeContext: null });
        assert(cm.isInCache('test', 'templateId'));
        cm.deleteFromCacheAndBackend('test', 'templateId', (err) => {
          assert(!err);
          assert(!cm.isInCache('test', 'templateId'));
          done();
        });
      });

      it('getAllFiles', function (done) {
        cm.getAllFiles((err, files) => {
          assert(err);
          assert(!files);
          done();
        });
      });

      it(`readTemplateOnBackend without content`, function (done) {
        cm.readTemplateOnBackend('bla', 'something', (err, templateContent) => {
          assert(err);
          assert(!templateContent);
          done();
        });
      });

      it(`readTemplateOnBackend with content`, function (done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, rawData) => {
          const template = JSON.parse(rawData);
          template.user = 'test';
          const rc = new RosaeContext(template, rosaeNlgCompUs, 'tests');
          cm.setInCache('test', 'templateId', { templateSha1: 'somesha1', rosaeContext: rc }, false);

          cm.readTemplateOnBackend('test', 'templateId', (err, templateContent) => {
            assert(!err);
            assert(templateContent);
            cm.deleteFromCache('test', 'templateId');
            done();
          });
        });
      });

      it(`getUserAndTemplateId`, function () {
        assert.throws(() => {
          cm.getUserAndTemplateId('blabla');
        }, /getUserAndTemplateId/);
      });

      it(`saveOnBackend`, function (done) {
        cm.saveOnBackend('test', 'test', (err) => {
          assert(err);
          done();
        });
      });

      it(`deleteFromBackend`, function (done) {
        cm.deleteFromBackend('test', (err) => {
          assert(err);
          done();
        });
      });

      it(`getIdsInCache, excluding temp ones`, function (done) {
        cm.setInCache('test', 'template', 'toto');
        cm.setInCache('test', 'templateTemp', 'totoTemp', true);
        const ids = cm.getIdsInCache('test');
        assert.equal(ids.length, 1);
        assert.equal(ids[0], 'template');
        cm.deleteFromCache('test', 'template');
        cm.deleteFromCache('test', 'templateTemp');
        done();
      });

      it(`compSaveAndLoad should work`, function (done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, rawData) => {
          cm.compSaveAndLoad(JSON.parse(rawData), false, (err, templateSha1, rosaeContext) => {
            assert(!err);
            assert(templateSha1);
            assert(rosaeContext);
            done();
          });
        });
      });
    });
  });
  describe('edge', function () {
    describe('no cache', function () {
      let cm = null;
      before(function (done) {
        cm = new MemoryRosaeContextsManager(rosaeNlgCompUs, {
          enableCache: false,
        });
        done();
      });
      it(`isInCache should fail`, function (done) {
        assert.throws(() => {
          cm.isInCache('test', 'test');
        }, /enableCache/);
        done();
      });
    });
    describe('no features', function () {
      let cm = null;
      before(function (done) {
        cm = new MemoryRosaeContextsManager(null, {
          enableCache: false,
        });
        done();
      });
      it(`getVersion should fail`, function (done) {
        assert.throws(() => {
          cm.getVersion();
        }, /500/);
        done();
      });
    });
  });
});
