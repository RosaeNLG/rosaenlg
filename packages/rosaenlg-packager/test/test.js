const assert = require('assert');
const lib = require('../dist/index.js');
const fs = require('fs');
const rosaenlg = require('rosaenlg');

function getStaticFsForIncluded() {
  const toBeIncluded = [
    'test/includes/test.pug',
    'test/includes/inc/included.pug',
    'test/includes/inc/includedLocal.pug',
  ];
  const staticFs = {};
  for (let i = 0; i < toBeIncluded.length; i++) {
    const filename = toBeIncluded[i];
    staticFs[filename] = fs.readFileSync(filename, 'utf8');
  }
  return staticFs;
}

describe('rosaenlg-packager', function () {
  describe('#compileTemplateToJsString', function () {
    it('no static fs', function (done) {
      const res = lib.compileTemplateToJsString('test/test.pug', 'en_US', null, rosaenlg, false, true);
      assert(res.indexOf(';pug_debug_line') > -1);
      const compiledFct = new Function('params', `${res}; return template(params);`);
      const rendered = compiledFct({
        util: new rosaenlg.NlgLib({ language: 'en_US' }),
      });
      assert(rendered.indexOf('He sang') > -1);
      done();
    });

    it('with static fs', function (done) {
      const res = lib.compileTemplateToJsString('test/includes/test.pug', 'en_US', getStaticFsForIncluded(), rosaenlg);
      const compiledFct = new Function('params', `${res}; return template(params);`);
      const rendered = compiledFct({
        util: new rosaenlg.NlgLib({ language: 'en_US' }),
      });
      assert(rendered.indexOf('Bla') > -1);
      done();
    });

    it('with export', function (done) {
      const res = lib.compileTemplateToJsString('test/includes/test.pug', 'en_US', null, rosaenlg, true, true);
      assert(res.indexOf('export default template;') > -1);
      done();
    });

    it('check no fs when no compile debug', function (done) {
      const res = lib.compileTemplateToJsString('test/includes/test.pug', 'en_US', null, rosaenlg, false, false);
      assert.equal(res.indexOf('require("fs")'), -1);
      done();
    });
  });

  describe('#completePackagedTemplateJson', function () {
    describe('nominal', function () {
      it(`basic`, function () {
        const packagedObj = {
          src: {
            templateId: 'test_inc',
            entryTemplate: 'test/includes/test.pug',
            compileInfo: {
              activate: false,
              compileDebug: false,
              language: 'en_US',
            },
            autotest: {
              activate: true,
              input: {
                language: 'en_US',
              },
              expected: ['Bla', 'included'],
            },
          },
        };

        lib.completePackagedTemplateJson(packagedObj, rosaenlg);
        //console.log(JSON.stringify(packagedObj));
        assert.equal(packagedObj.format, '2.0.0');
        assert.equal(packagedObj.src.templateId, 'test_inc');
        assert(packagedObj.src != null);
        assert(packagedObj.comp == null);
        assert.equal(packagedObj.src.entryTemplate, 'test/includes/test.pug');
        assert.equal(Object.keys(packagedObj.src.templates).length, 3);
        assert.equal(packagedObj.src.autotest.input.language, 'en_US');

        assert(packagedObj.src.templates['test/includes/test.pug'].indexOf('bla') > -1);
        assert(packagedObj.src.templates['test/includes/inc/included.pug'].indexOf('| included') > -1);
        assert(packagedObj.src.templates['test/includes/inc/includedLocal.pug'].indexOf('some test') > -1);
      });
      it(`with comp`, function () {
        const packagedObj = {
          src: {
            templateId: 'test_inc',
            entryTemplate: 'test/includes/test.pug',
            compileInfo: {
              activate: true,
              compileDebug: false,
              language: 'en_US',
            },
          },
        };

        lib.completePackagedTemplateJson(packagedObj, rosaenlg);

        // console.log(JSON.stringify(packagedObj));
        assert(!packagedObj.activate);
        assert(packagedObj.comp != null && packagedObj.comp.compiled != null);
        assert(packagedObj.comp.compiledBy.indexOf('packager') > -1);
        assert(packagedObj.comp.compiledWhen != null);
        assert(packagedObj.comp.compiled.indexOf('bla') > -1);
        assert(packagedObj.comp.compiled.indexOf('pug_html') > -1);
      });
    });

    describe('with static fs', function () {
      it(`with comp`, function () {
        const packagedObj = {
          src: {
            templateId: 'test_inc',
            entryTemplate: 'test/includes/test.pug',
            compileInfo: {
              activate: true,
              compileDebug: false,
              language: 'en_US',
            },
            templates: getStaticFsForIncluded(),
          },
        };

        lib.completePackagedTemplateJson(packagedObj, rosaenlg);

        // console.log(JSON.stringify(packagedObj));
        assert(!packagedObj.activate);
        assert(packagedObj.comp != null && packagedObj.comp.compiled != null);
        assert(packagedObj.comp.compiledBy.indexOf('packager') > -1);
        assert(packagedObj.comp.compiledWhen != null);
        assert(packagedObj.comp.compiled.indexOf('bla') > -1);
        assert(packagedObj.comp.compiled.indexOf('pug_html') > -1);
      });
    });

    describe('edge', function () {
      it(`invalid path`, function () {
        assert.throws(
          () =>
            lib.completePackagedTemplateJson(
              {
                src: {
                  templateId: 'test_inc',
                  entryTemplate: 'bla/test.pug',
                },
              },
              rosaenlg,
            ),

          /no such file or directory/,
        );
      });
    });
  });
});
