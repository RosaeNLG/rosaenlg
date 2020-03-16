const assert = require('assert');
const fs = require('fs');
const DiskRosaeContextsManager = require('../dist/DiskRosaeContextsManager').DiskRosaeContextsManager;
const RosaeContext = require('../dist/RosaeContext').RosaeContext;
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompFr = require(`rosaenlg/dist/rollup/rosaenlg_tiny_fr_FR_${version}_comp`);

describe('RosaeContextsManager', function() {
  let someContext = null;
  let someCacheValue = null;
  const basicASha1 = '3027e9c68f951f79ae1c5a8e2df41f80dcdef2a7';

  before(function(done) {
    fs.readFile('test/templates/basic_a.json', 'utf8', (err, rawData) => {
      const template = JSON.parse(rawData);
      template.user = 'test';
      someContext = new RosaeContext(template, null, 'tests');
      someCacheValue = { templateSha1: basicASha1, rosaeContext: someContext };
      done();
    });
  });

  describe('with disk that works and cache', function() {
    let cm = null;
    let cmWithComp = null;
    const testFolder = './test-disk';
    before(function(done) {
      fs.mkdir(testFolder, () => {
        cm = new DiskRosaeContextsManager(testFolder, null, {
          origin: 'test',
        });
        cmWithComp = new DiskRosaeContextsManager(testFolder, rosaeNlgCompFr, {
          origin: 'test',
        });
        done();
      });
    });
    after(function(done) {
      fs.rmdir(testFolder, done);
    });

    describe('nominal', function() {
      describe('getFromCacheOrLoad', function() {
        it(`already here with good sha1`, function(done) {
          cm.setInCache('test', 'basic_a', someCacheValue, false);
          cm.getFromCacheOrLoad('test', 'basic_a', basicASha1, (err, cacheValue) => {
            assert(!err);
            assert(cacheValue);
            cm.deleteFromCache('test', 'basic_a');
            done();
          });
        });
        it(`no sha1 provided, but is here`, function(done) {
          cm.setInCache('test', 'basic_a', someCacheValue, false);
          cm.getFromCacheOrLoad('test', 'basic_a', null, (err, cacheValue) => {
            assert(!err);
            assert(cacheValue);
            cm.deleteFromCache('test', 'basic_a');
            done();
          });
        });
        it(`no sha1 provided, and not here`, function(done) {
          cm.getFromCacheOrLoad('test', 'blablabla', null, (err, cacheValue) => {
            assert(err);
            assert(!cacheValue);
            done();
          });
        });
        it(`has to load`, function(done) {
          fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
            fs.writeFile(`${testFolder}/test#basic_a.json`, data, 'utf8', () => {
              cm.getFromCacheOrLoad('test', 'basic_a', basicASha1, (err, cacheValue) => {
                assert(!err, err);
                assert(cacheValue);
                cm.deleteFromCache('test', 'basic_a');
                fs.unlink(`${testFolder}/test#basic_a.json`, done);
              });
            });
          });
        });
      });

      it(`getFromCache`, function() {
        cm.setInCache('test', 'basic_a', someCacheValue, false);
        const fromCache = cm.getFromCache('test', 'basic_a');
        assert(fromCache);
        assert((fromCache.templateSha1 = basicASha1));
        cm.deleteFromCache('test', 'basic_a');
      });

      it(`isInCache`, function() {
        cm.setInCache('test', 'basic_a', someCacheValue, false);
        assert(cm.isInCache('test', 'basic_a'));
        cm.deleteFromCache('test', 'basic_a');
      });

      describe(`isInCacheWithGoodSha1`, function() {
        it(`is in with good sha1`, function() {
          cm.setInCache('test', 'basic_a', someCacheValue, false);
          assert(cm.isInCacheWithGoodSha1('test', 'basic_a', basicASha1));
          cm.deleteFromCache('test', 'basic_a');
        });
        it(`is in but not good sha1`, function() {
          cm.setInCache('test', 'basic_a', someCacheValue, false);
          assert(!cm.isInCacheWithGoodSha1('test', 'basic_a', 'someOTHERsha1'));
          cm.deleteFromCache('test', 'basic_a');
        });
        it(`is not in cache`, function() {
          assert(!cm.isInCacheWithGoodSha1('test', 'basic_a', basicASha1));
        });
      });

      it(`setInCache`, function(done) {
        cm.setInCache('test', 'basic_a', someCacheValue, false);
        const ids = cm.getIdsInCache('test');
        assert.equal(ids.length, 1);
        assert.equal(ids[0], 'basic_a');
        cm.deleteFromCache('test', 'basic_a');
        done();
      });
      it(`deleteFromCache`, function(done) {
        cm.setInCache('test', 'basic_a', someCacheValue, false);
        cm.deleteFromCache('test', 'basic_a');
        const ids = cm.getIdsInCache('test');
        assert.equal(ids.length, 0);
        done();
      });
      it(`getIdsInCache`, function(done) {
        cm.setInCache('test', 'basic_a', someCacheValue, false);
        const ids = cm.getIdsInCache('test');
        assert.equal(ids.length, 1);
        assert.equal(ids[0], 'basic_a');
        cm.deleteFromCache('test', 'basic_a');
        done();
      });
      it(`getIdsFromBackend`, function(done) {
        fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
          const template = JSON.parse(rawData);
          template.user = 'test';
          fs.writeFile(`${testFolder}/test#chanson.json`, JSON.stringify(template), 'utf8', () => {
            cm.getIdsFromBackend('test', (err, templates) => {
              assert(!err);
              assert.equal(templates.length, 1);
              assert.equal(templates[0], 'chanson');
              fs.unlink(`${testFolder}/test#chanson.json`, done);
            });
          });
        });
      });
      describe('compSaveAndLoad', function() {
        it(`success`, function(done) {
          fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
            const template = JSON.parse(rawData);
            template.user = 'test';
            cm.compSaveAndLoad(template, true, (err, templateSha1, rosaeContext) => {
              assert(!err);
              assert(templateSha1);
              assert(rosaeContext);
              fs.unlink(`${testFolder}/test#chanson.json`, done);
            });
          });
        });
        it(`no template ID success`, function(done) {
          fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
            const template = JSON.parse(rawData);
            template.user = 'test';
            delete template.templateId;
            cm.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
              assert(err);
              assert.equal(err.message, 'no templateId!');
              done();
            });
          });
        });
        it(`invalid template`, function(done) {
          // we need to be able to compile for that, unless no exception
          fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
            const template = JSON.parse(rawData);
            template.user = 'test';
            delete template.src.entryTemplate;
            cmWithComp.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
              assert(err);
              assert(err.message.indexOf('cannot compile') > -1);
              done();
            });
          });
        });
      });
    });

    describe('edge', function() {
      it(`readTemplateOnBackend invalid file name`, function(done) {
        fs.writeFile(`${testFolder}/toto.json`, 'bla', 'utf8', () => {
          cm.getIdsFromBackend('test', (err, templates) => {
            assert(!err);
            assert.equal(templates.length, 0);
            fs.unlink(`${testFolder}/toto.json`, done);
          });
        });
      });
    });

    /*
    describe('edge', function() {
      it(`readTemplateOnBackend file does not exist`, function(done) {
        cm.readTemplateOnBackend('test', 'blablabla', (err, templateSha1, templateContent) => {
          assert(err);
          assert.equal(err.name, 404);
          assert(!templateSha1);
          assert(!templateContent);
          done();
        });
      });
      it(`readTemplateOnBackend invalid JSON`, function(done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          data = data.replace('{', '');
          fs.writeFile(`${testFolder}/test#basic_a.json`, data, 'utf8', () => {
            cm.readTemplateOnBackend('test', 'basic_a', (err, templateSha1, templateContent) => {
              assert(err);
              assert.equal(err.name, 500);
              assert(!templateSha1);
              assert(!templateContent);
              fs.unlink(`${testFolder}/test#basic_a.json`, done);
            });
          });
        });
      });
    });
    */
  });

  describe('with short ttl', function() {
    let cm = null;
    const testFolder = './test-disk';
    before(function(done) {
      fs.mkdir(testFolder, () => {
        cm = new DiskRosaeContextsManager(testFolder, null, {
          origin: 'test',
          specificTtl: 1,
          forgetTemplates: false,
        });
        done();
      });
    });
    after(function(done) {
      fs.rmdir(testFolder, done);
    });
    it(`forgets templates`, function(done) {
      cm.setInCache('test', 'basic_a', someCacheValue, true);
      assert(cm.isInCache('test', 'basic_a'));
      setTimeout(() => {
        assert(!cm.isInCache('test', 'basic_a'));
        done();
      }, 1500);
    });
  });
});
