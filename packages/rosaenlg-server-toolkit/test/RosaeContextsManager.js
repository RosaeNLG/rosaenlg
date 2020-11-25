/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const fs = require('fs');
const DiskRosaeContextsManager = require('../dist/DiskRosaeContextsManager').DiskRosaeContextsManager;
const RosaeContext = require('../dist/RosaeContext').RosaeContext;
const version = require('rosaenlg/package.json').version;
const rosaeNlgCompFr = require(`rosaenlg/dist/rollup/rosaenlg_tiny_fr_FR_${version}_comp`);
const rosaeNlgCompUs = require(`rosaenlg/dist/rollup/rosaenlg_tiny_en_US_${version}_comp`);

describe('RosaeContextsManager', function () {
  describe('some stuff', function () {
    let someContext = null;
    let someCacheValue = null;

    let basicASha1;

    before(function (done) {
      fs.readFile('test/templates/basic_a.json', 'utf8', (err, rawData) => {
        const template = JSON.parse(rawData);
        template.user = 'test';
        someContext = new RosaeContext(template, rosaeNlgCompUs, 'tests');
        basicASha1 = someContext.getSha1();
        someCacheValue = { templateSha1: basicASha1, rosaeContext: someContext };
        done();
      });
    });

    describe('with disk that works and cache', function () {
      let cmWithCompEn = null;
      let cmWithCompFr = null;
      const testFolder = './test-disk';
      before(function (done) {
        fs.mkdir(testFolder, () => {
          cmWithCompEn = new DiskRosaeContextsManager(testFolder, rosaeNlgCompUs, {});
          cmWithCompFr = new DiskRosaeContextsManager(testFolder, rosaeNlgCompFr, {});
          done();
        });
      });
      after(function (done) {
        fs.rmdir(testFolder, done);
      });

      describe('nominal', function () {
        describe('getFromCacheOrLoad', function () {
          it(`already here with good sha1`, function (done) {
            cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
            cmWithCompEn.getFromCacheOrLoad('test', 'basic_a', basicASha1, (err, cacheValue) => {
              assert(!err);
              assert(cacheValue);
              cmWithCompEn.deleteFromCache('test', 'basic_a');
              done();
            });
          });
          it(`no sha1 provided, but is here`, function (done) {
            cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
            cmWithCompEn.getFromCacheOrLoad('test', 'basic_a', null, (err, cacheValue) => {
              assert(!err);
              assert(cacheValue);
              cmWithCompEn.deleteFromCache('test', 'basic_a');
              done();
            });
          });
          it(`no sha1 provided, and not here`, function (done) {
            cmWithCompEn.getFromCacheOrLoad('test', 'blablabla', null, (err, cacheValue) => {
              assert(err);
              assert(!cacheValue);
              done();
            });
          });
          it(`has to load`, function (done) {
            fs.readFile('test/templates/basic_a.json', 'utf8', (err, data) => {
              fs.writeFile(`${testFolder}/test#basic_a.json`, data, 'utf8', () => {
                cmWithCompEn.getFromCacheOrLoad('test', 'basic_a', basicASha1, (err, cacheValue) => {
                  assert(!err, err);
                  assert(cacheValue);
                  cmWithCompEn.deleteFromCache('test', 'basic_a');
                  fs.unlink(`${testFolder}/test#basic_a.json`, done);
                });
              });
            });
          });
        });

        it(`getFromCache`, function () {
          cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
          const fromCache = cmWithCompEn.getFromCache('test', 'basic_a');
          assert(fromCache);
          assert((fromCache.templateSha1 = basicASha1));
          cmWithCompEn.deleteFromCache('test', 'basic_a');
        });

        it(`isInCache`, function () {
          cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
          assert(cmWithCompEn.isInCache('test', 'basic_a'));
          cmWithCompEn.deleteFromCache('test', 'basic_a');
        });

        describe(`isInCacheWithGoodSha1`, function () {
          it(`is in with good sha1`, function () {
            cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
            assert(cmWithCompEn.isInCacheWithGoodSha1('test', 'basic_a', basicASha1));
            cmWithCompEn.deleteFromCache('test', 'basic_a');
          });
          it(`is in but not good sha1`, function () {
            cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
            assert(!cmWithCompEn.isInCacheWithGoodSha1('test', 'basic_a', 'someOTHERsha1'));
            cmWithCompEn.deleteFromCache('test', 'basic_a');
          });
          it(`is not in cache`, function () {
            assert(!cmWithCompEn.isInCacheWithGoodSha1('test', 'basic_a', basicASha1));
          });
        });

        it(`setInCache`, function (done) {
          cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
          const ids = cmWithCompEn.getIdsInCache('test');
          assert.strictEqual(ids.length, 1);
          assert.strictEqual(ids[0], 'basic_a');
          cmWithCompEn.deleteFromCache('test', 'basic_a');
          done();
        });
        it(`deleteFromCache`, function (done) {
          cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
          cmWithCompEn.deleteFromCache('test', 'basic_a');
          const ids = cmWithCompEn.getIdsInCache('test');
          assert.strictEqual(ids.length, 0);
          done();
        });
        it(`getIdsInCache`, function (done) {
          cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, false);
          const ids = cmWithCompEn.getIdsInCache('test');
          assert.strictEqual(ids.length, 1);
          assert.strictEqual(ids[0], 'basic_a');
          cmWithCompEn.deleteFromCache('test', 'basic_a');
          done();
        });
        it(`getIdsFromBackend`, function (done) {
          fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
            const template = JSON.parse(rawData);
            template.user = 'test';
            fs.writeFile(`${testFolder}/test#chanson.json`, JSON.stringify(template), 'utf8', () => {
              cmWithCompEn.getIdsFromBackend('test', (err, templates) => {
                assert(!err);
                assert.strictEqual(templates.length, 1);
                assert.strictEqual(templates[0], 'chanson');
                fs.unlink(`${testFolder}/test#chanson.json`, done);
              });
            });
          });
        });
        describe('compSaveAndLoad', function () {
          it(`success`, function (done) {
            fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
              const template = JSON.parse(rawData);
              template.user = 'test';
              cmWithCompFr.compSaveAndLoad(template, true, (err, templateSha1, rosaeContext) => {
                assert(!err);
                assert(templateSha1);
                assert(rosaeContext);
                fs.unlink(`${testFolder}/test#chanson.json`, done);
              });
            });
          });
          it(`no template ID success`, function (done) {
            fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
              const template = JSON.parse(rawData);
              template.user = 'test';
              delete template.templateId;
              cmWithCompFr.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
                assert(err);
                assert.strictEqual(err.message, 'no templateId!');
                done();
              });
            });
          });
          it(`invalid template`, function (done) {
            // we need to be able to compile for that, unless no exception
            fs.readFile('test/templates/chanson.json', 'utf8', (err, rawData) => {
              const template = JSON.parse(rawData);
              template.user = 'test';
              delete template.src.entryTemplate;
              cmWithCompFr.compSaveAndLoad(template, true, (err, _templateSha1, _rosaeContext) => {
                assert(err);
                assert(err.message.indexOf('cannot compile') > -1);
                done();
              });
            });
          });
        });
      });

      describe('edge', function () {
        it(`getIdsFromBackend invalid file name`, function (done) {
          fs.writeFile(`${testFolder}/toto.json`, 'bla', 'utf8', () => {
            cmWithCompEn.getIdsFromBackend('test', (err, templates) => {
              assert(!err);
              assert.strictEqual(templates.length, 0);
              fs.unlink(`${testFolder}/toto.json`, done);
            });
          });
        });
      });
    });

    describe('with short ttl', function () {
      let cmWithCompEn = null;
      const testFolder = './test-disk';
      before(function (done) {
        fs.mkdir(testFolder, () => {
          cmWithCompEn = new DiskRosaeContextsManager(testFolder, rosaeNlgCompUs, {
            //origin: 'test',
            specificTtl: 1,
            forgetTemplates: false,
          });
          done();
        });
      });
      after(function (done) {
        fs.rmdir(testFolder, done);
      });
      it(`forgets templates`, function (done) {
        cmWithCompEn.setInCache('test', 'basic_a', someCacheValue, true);
        assert(cmWithCompEn.isInCache('test', 'basic_a'));
        setTimeout(() => {
          assert(!cmWithCompEn.isInCache('test', 'basic_a'));
          done();
        }, 1500);
      });
    });
  });
  describe('shared', function () {
    before(function (done) {
      done();
    });

    describe('nominal', function () {
      let cmWithCompFr = null;
      const testFolder = './test-disk-shared';
      before(function (done) {
        fs.mkdir(testFolder, () => {
          cmWithCompFr = new DiskRosaeContextsManager(testFolder, rosaeNlgCompFr, { sharedTemplatesUser: 'shared' });
          fs.readFile('test/templates/chanson.json', 'utf8', (err, data) => {
            const parsed = JSON.parse(data);
            parsed.user = 'shared';
            cmWithCompFr.compSaveAndLoad(parsed, true, (err, sha1, rosaeContext) => {
              done();
            });
          });
        });
      });
      after(function (done) {
        fs.unlink(testFolder + '/shared#chanson.json', () => {
          fs.rmdir(testFolder, done);
        });
      });
      describe('create shared', function () {
        it('create shared', function (done) {
          cmWithCompFr.compSaveAndLoad(
            { templateId: 'myChanson', type: 'existing', which: 'chanson', user: 'toto' },
            true,
            (err, sha1, rosaeContext) => {
              assert(!err, err);
              assert(sha1 != null);
              assert.strictEqual(rosaeContext.getTemplateId(), 'myChanson');
              done();
            },
          );
        });
        after(function (done) {
          fs.unlink(testFolder + '/toto#myChanson.json', done);
        });
      });
      describe('get and render shared', function () {
        before(function (done) {
          cmWithCompFr.compSaveAndLoad(
            { templateId: 'myChanson', type: 'existing', which: 'chanson', user: 'toto' },
            true,
            () => {
              done();
            },
          );
        });
        it('should get without src and comp', function (done) {
          const cacheValue = cmWithCompFr.getFromCache('toto', 'myChanson');
          assert(cacheValue);
          const template = cacheValue.rosaeContext.getFullTemplate();
          // console.log(template);
          assert.strictEqual(template.templateId, 'myChanson');
          assert.strictEqual(template.type, 'existing');
          assert.strictEqual(template.which, 'chanson');
          assert(!template.src);
          assert(!template.comp);
          done();
        });

        it('should render comp', function (done) {
          const cacheValue = cmWithCompFr.getFromCache('toto', 'myChanson');
          assert(cacheValue);
          const res = cacheValue.rosaeContext.render({
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
        after(function (done) {
          fs.unlink(testFolder + '/toto#myChanson.json', done);
        });
      });
    });
    describe('edge', function () {
      describe('shared not activated', function () {
        let cmWithCompFr = null;
        const testFolder = './test-disk-shared-edge';
        before(function (done) {
          fs.mkdir(testFolder, () => {
            cmWithCompFr = new DiskRosaeContextsManager(testFolder, rosaeNlgCompFr, {
              /* no shared */
            });
            done();
          });
        });
        after(function (done) {
          fs.rmdir(testFolder, done);
        });
        it('create shared should fail', function (done) {
          cmWithCompFr.compSaveAndLoad(
            { templateId: 'myChanson', type: 'existing', which: 'chanson', user: 'toto' },
            true,
            (err, sha1, rosaeContext) => {
              assert(err);
              assert(err.message.indexOf('not activated') > -1, err);
              assert(!sha1);
              assert(!rosaeContext);
              done();
            },
          );
        });
      });

      describe('shared which is invalid', function () {
        let cmWithCompFrInvalid = null;
        const testFolder = './test-disk-shared-edge-invalid';
        before(function (done) {
          fs.mkdir(testFolder, () => {
            cmWithCompFrInvalid = new DiskRosaeContextsManager(testFolder, rosaeNlgCompFr, {
              sharedTemplatesUser: 'shared',
            });
            fs.readFile('test/templates/chanson.json', 'utf8', (err, data) => {
              // add an error
              data = data.replace('#[+verb', 'blablabla');
              const parsed = JSON.parse(data);
              parsed.user = 'shared';
              cmWithCompFrInvalid.compSaveAndLoad(parsed, true, (err, sha1, rosaeContext) => {
                // fails, but we don't care
                done();
              });
            });
          });
        });
        after(function (done) {
          fs.rmdir(testFolder, done);
        });

        it('create shared should fail', function (done) {
          cmWithCompFrInvalid.compSaveAndLoad(
            { templateId: 'myChanson', type: 'existing', which: 'chanson', user: 'toto' },
            true,
            (err, sha1, rosaeContext) => {
              assert(err);
              console.log(err.message.indexOf('cannot load shared') > -1);
              assert(!sha1);
              assert(!rosaeContext);
              done();
            },
          );
        });
      });
    });
  });
});
