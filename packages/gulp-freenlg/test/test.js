const assert = require('assert');
const lib = require('../dist/index.js');
const fs = require('fs');

// ugly
const NlgLib = require('../../freenlg/dist/NlgLib').NlgLib;

describe('gulp-freenlg', function() {
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
      [/*true, */ false].forEach(function(tinify) {
        it(`tinify ${tinify}`, function(done) {
          const tmpFile = `restmp_${tinify}.js`;
          let os = lib.compileTemplates(
            [{ source: 'test/test.pug', name: 'test' }],
            'en_US',
            tmpFile,
            'templates_holder',
            tinify,
          );

          os.on('finish', function() {
            const compiledString = fs.readFileSync(tmpFile, 'utf-8');
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
      let sources = [{ source: 'bla', name: 'bla' }];
      it(`invalid dest`, function() {
        assert.throws(() => lib.compileTemplates(sources, 'fr_FR', null, 'holder'), /destination/);
      });
      it(`invalid holder`, function() {
        assert.throws(() => lib.compileTemplates(sources, 'fr_FR', 'dest', null), /holder/);
      });
    });
  });
});
