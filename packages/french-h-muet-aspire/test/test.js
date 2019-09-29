const lib = require('../dist/index.js');
const assert = require('assert');

describe('french-h-muet-aspire', function() {
  describe('#isHAspire()', function() {
    it('hâbleuse aspiré', function() {
      assert(lib.isHAspire('hâbleuse'));
    });
    it('homme pas aspiré', function() {
      assert(!lib.isHAspire('homme'));
    });
    it('toto pas aspiré', function() {
      assert(!lib.isHAspire('toto'));
    });
  });
  describe('#isHMuet()', function() {
    it('homme muet', function() {
      assert(lib.isHMuet('homme'));
    });
    it('toto pas muet', function() {
      assert(!lib.isHMuet('toto'));
    });
  });
  describe('#getCompleteList()', function() {
    it('hérisson', function() {
      assert(lib.getCompleteList().indexOf('hérisson') > -1);
    });
  });
});
