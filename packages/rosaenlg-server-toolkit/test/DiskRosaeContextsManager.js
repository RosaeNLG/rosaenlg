const assert = require('assert');
const fs = require('fs');
const sha1 = require('sha1');
const DiskRosaeContextsManager = require('../dist/DiskRosaeContextsManager').DiskRosaeContextsManager;

describe('DiskRosaeContextsManager', function() {
  describe('with disk that works', function() {
    const testFolder = './test-disk';
    let cm = null;
    before(function(done) {
      fs.mkdir(testFolder, () => {
        cm = new DiskRosaeContextsManager(testFolder, null, {
          origin: 'test',
        });
        done();
      });
    });

    describe('nominal', function() {
      it(`has backend`, function() {
        assert(cm.hasBackend());
      });

      it(`is healthy`, function(done) {
        cm.checkHealth(err => {
          assert(!err);
          done();
        });
      });
      it('getFilename', function() {
        assert.equal(cm.getFilename('test', 'toto'), 'test#toto.json');
      });

      it('getAllFiles', function(done) {
        fs.writeFile(`${testFolder}/test1`, 'test1', 'utf8', () => {
          fs.writeFile(`${testFolder}/test2`, 'test2', 'utf8', () => {
            cm.getAllFiles((err, files) => {
              assert(!err);
              assert.equal(files.length, 2);
              assert(files.indexOf('test1') > -1);
              assert(files.indexOf('test2') > -1);
              fs.unlink(`${testFolder}/test1`, () => {
                fs.unlink(`${testFolder}/test2`, done);
              });
            });
          });
        });
      });

      it(`readTemplateOnBackend`, function(done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          fs.writeFile(`${testFolder}/test#basic_a.json`, data, 'utf8', () => {
            cm.readTemplateOnBackend('test', 'basic_a', (err, templateSha1, templateContent) => {
              assert(!err);
              assert(templateSha1);
              assert(templateContent);
              assert(JSON.stringify(templateContent).indexOf('Aaa') > -1);
              fs.unlink(`${testFolder}/test#basic_a.json`, done);
            });
          });
        });
      });

      it(`getUserAndTemplateId`, function(done) {
        const res = cm.getUserAndTemplateId('test#toto.json');
        assert(res != null);
        assert.equal(res.user, 'test');
        assert.equal(res.templateId, 'toto');
        done();
      });

      it(`saveOnBackend`, function(done) {
        cm.saveOnBackend('test', 'test', err => {
          assert(!err);
          fs.readFile(`${testFolder}/test`, 'utf8', (err, data) => {
            assert(!err);
            assert.equal(data, 'test');
            fs.unlink(`${testFolder}/test`, () => {
              done();
            });
          });
        });
      });

      it(`deleteFromBackend`, function(done) {
        fs.writeFile(`${testFolder}/test`, 'test', 'utf8', () => {
          cm.deleteFromBackend('test', err => {
            assert(!err);
            fs.readFile(`${testFolder}/test`, 'utf8', (err, data) => {
              assert(err != null);
              assert(!data);
              done();
            });
          });
        });
      });

      it(`deleteFromCacheAndBackend`, function(done) {
        fs.writeFile(`${testFolder}/bla#bla.json`, 'test', 'utf8', () => {
          cm.deleteFromCacheAndBackend('bla', 'bla', err => {
            assert(!err);
            done();
          });
        });
      });

      it(`reloadAllFiles with valid file on disk`, function(done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          const parsed = JSON.parse(data);
          parsed.user = 'test';
          const dataWithUser = JSON.stringify(parsed);
          fs.writeFile(`${testFolder}/test#basic_a.json`, dataWithUser, 'utf8', () => {
            cm.reloadAllFiles(err => {
              assert(!err);
              setTimeout(() => {
                assert(cm.isInCache('test', 'basic_a'));
                fs.unlink(`${testFolder}/test#basic_a.json`, done);
              }, 500);
            });
          });
        });
      });
    });

    describe('without cache', function() {
      const cmNoCache = new DiskRosaeContextsManager(testFolder, null, {
        origin: 'test',
        enableCache: false,
      });
      it(`compSaveAndLoad`, function(done) {
        fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
          const template = JSON.parse(rawData);
          template.user = 'test';
          cmNoCache.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
            assert(!err);
            assert(!cm.isInCache('test', 'chanson'));
            fs.unlink(`${testFolder}/test#chanson.json`, done);
          });
        });
      });
      it(`deleteFromCacheAndBackend`, function(done) {
        fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
          const template = JSON.parse(rawData);
          template.user = 'test';
          fs.writeFile(`${testFolder}/test#chanson.json`, JSON.stringify(template), 'utf8', () => {
            cmNoCache.deleteFromCacheAndBackend('test', 'chanson', err => {
              assert(!err);
              done();
            });
          });
        });
      });
    });

    describe('edge', function() {
      it(`reloadAllFiles with invalid file on disk`, function(done) {
        fs.writeFile(`${testFolder}/bla.json`, 'test', 'utf8', () => {
          cm.reloadAllFiles(err => {
            assert(!err);
            fs.unlink(`${testFolder}/bla.json`, done);
          });
        });
      });

      it(`readTemplateOnBackend file does not exist`, function(done) {
        cm.readTemplateOnBackend('test', 'blablabla', (err, templateSha1, templateContent) => {
          assert(err);
          assert.equal(err.name, 404);
          assert(!templateSha1);
          assert(!templateContent);
          done();
        });
      });

      it(`readTemplateOnBackendAndLoad file does not exist`, function(done) {
        cm.readTemplateOnBackendAndLoad('test', 'blablabla', (err, templateSha1) => {
          assert(err);
          assert(err.message.indexOf('not found on disk') > -1);
          assert(!templateSha1);
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
      it(`getFromCacheOrLoad wrong sha1`, function(done) {
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          fs.writeFile(`${testFolder}/test#basic_a.json`, data, 'utf8', () => {
            cm.getFromCacheOrLoad('test', 'basic_a', 'wrongsha1', (err, cacheValue) => {
              assert(err);
              assert(err.message.indexOf('sha1 do not correspond') > -1);
              assert(!cacheValue);
              fs.unlink(`${testFolder}/test#basic_a.json`, done);
            });
          });
        });
      });
      it(`getFromCacheOrLoad cannot compile`, function(done) {
        // must at least try to compile, thus have a compiler!
        const cmFakeComp = new DiskRosaeContextsManager(
          testFolder,
          {
            compileFileClient: 'toto',
          },
          {
            origin: 'test',
          },
        );
        fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
          data = data.replace('|', '|#[XX');
          const hackedData = JSON.parse(data);
          const theSha1 = sha1(JSON.stringify(hackedData.src));
          fs.writeFile(`${testFolder}/test#basic_a.json`, JSON.stringify(hackedData), 'utf8', () => {
            cmFakeComp.getFromCacheOrLoad('test', 'basic_a', theSha1, (err, cacheValue) => {
              assert(err);
              assert(err.message.indexOf('could not compile') > -1);
              assert(!cacheValue);
              fs.unlink(`${testFolder}/test#basic_a.json`, done);
            });
          });
        });
      });
    });

    after(function(done) {
      fs.rmdir(testFolder, done);
    });
  });

  describe('with invalid disk', function() {
    const testFolder = './test-disk-invalid';
    const cm = new DiskRosaeContextsManager(testFolder, null, {
      origin: 'test',
    });

    it(`is not healthy`, function(done) {
      cm.checkHealth(err => {
        assert(err);
        done();
      });
    });

    it('getAllFiles fails', function(done) {
      cm.getAllFiles((err, files) => {
        assert(err);
        assert(!files);
        done();
      });
    });

    it('getIdsFromBackend fails', function(done) {
      cm.getIdsFromBackend('toto', (err, files) => {
        assert(err);
        assert(!files);
        done();
      });
    });

    it(`compSaveAndLoad must fail`, function(done) {
      fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
        const template = JSON.parse(rawData);
        template.user = 'test';
        cm.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
          assert(err);
          assert.equal(err.message, 'could not save to backend');
          done();
        });
      });
    });

    it(`deleteFromCacheAndBackend must fail`, function(done) {
      cm.deleteFromCacheAndBackend('bla', 'bla', err => {
        assert(err);
        assert(err.message.indexOf('delete failed') > -1);
        done();
      });
    });

    it(`reloadAllFiles must fail`, function(done) {
      cm.reloadAllFiles(err => {
        assert(err);
        done();
      });
    });
  });
});
