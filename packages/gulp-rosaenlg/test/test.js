const assert = require('assert');
const lib = require('../dist/index.js');
const fs = require('fs');

// ugly
const NlgLib = require('../../rosaenlg/dist/NlgLib').NlgLib;

describe('gulp-rosaenlg', function() {
  describe('#renderTemplateInFile', function() {
    describe('nominal', function() {
      const tmpFile = 'restmp.html';
      lib.renderTemplateInFile('test/test.pug', 'restmp.html', { language: 'en_US' });
      const rendered = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
      assert(rendered.indexOf('He sang') > -1);
    });
    describe('edge', function() {
      it(`no template`, function() {
        assert.throws(() => lib.renderTemplateInFile(null, 'toto', {}), /template/);
      });
      it(`no dest`, function() {
        assert.throws(() => lib.renderTemplateInFile('toto', null, {}), /destination/);
      });
    });
  });

  describe('#compileTemplates', function() {
    describe('nominal', function() {
      [true, false].forEach(function(tinify) {
        it(`tinify ${tinify}`, function(done) {
          const tmpFile = `restmp_${tinify}.js`;
          const os = lib.compileTemplates(
            [{ source: 'test/test.pug', name: 'test' }],
            'en_US',
            tmpFile,
            'templates_holder',
            tinify,
          );

          os.on('finish', function() {
            const compiledString = fs.readFileSync(tmpFile, 'utf-8');
            //console.log(compiledString);
            //console.log(`size: ${compiledString.length}`);
            fs.unlinkSync(tmpFile);

            const compiledFct = new Function('params', `${compiledString}; return templates_holder.test(params);`);
            const rendered = compiledFct({
              util: new NlgLib({ language: 'en_US' }),
            });
            assert(rendered.indexOf('He sang') > -1);
            done();
          });
        });
      });
    });
    describe('edge', function() {
      const sources = [{ source: 'bla', name: 'bla' }];
      it(`invalid dest`, function() {
        assert.throws(() => lib.compileTemplates(sources, 'fr_FR', null, 'holder'), /destination/);
      });
      it(`invalid holder`, function() {
        assert.throws(() => lib.compileTemplates(sources, 'fr_FR', 'dest', null), /holder/);
      });
    });
  });

  describe('#packageTemplateJson', function() {
    describe('nominal', function() {
      it(`basic`, function() {
        const packagedObj = lib.packageTemplateJson({
          templateId: 'test_inc',
          entryTemplate: 'test.pug',
          folderWithTemplates: 'test/includes',
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
        });
        // console.log(JSON.stringify(packagedObj));
        assert.equal(packagedObj.templateId, 'test_inc');
        assert.equal(packagedObj.entryTemplate, 'test.pug');
        assert.equal(Object.keys(packagedObj.templates).length, 2);
        assert.equal(packagedObj.autotest.input.language, 'en_US');

        assert(packagedObj.templates['test.pug'].indexOf('bla') > -1);
        assert(packagedObj.templates['inc/included.pug'].indexOf('included') > -1);
      });
      it(`with comp`, function() {
        const packagedObj = lib.packageTemplateJson({
          templateId: 'test_inc',
          entryTemplate: 'test.pug',
          folderWithTemplates: 'test/includes',
          compileInfo: {
            activate: true,
            compileDebug: false,
            language: 'en_US',
          },
        });
        // console.log(JSON.stringify(packagedObj));
        assert(!packagedObj.activate);
        assert(packagedObj.compiled != null);
        assert(packagedObj.compiled.indexOf('bla') > -1);
        assert(packagedObj.compiled.indexOf('pug_html') > -1);
      });
    });

    describe('edge', function() {
      it(`empty path`, function() {
        assert.throws(
          () =>
            lib.packageTemplateJson({
              templateId: 'test_inc',
              entryTemplate: 'test.pug',
              folderWithTemplates: 'test/includes/emptyDir',
            }),
          /no files found/,
        );
      });
      it(`invalid path`, function() {
        assert.throws(
          () =>
            lib.packageTemplateJson({
              templateId: 'test_inc',
              entryTemplate: 'test.pug',
              folderWithTemplates: 'bla',
            }),
          /no such file or directory/,
        );
      });
    });
  });
});
