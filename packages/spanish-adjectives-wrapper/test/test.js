const assert = require('assert');
const lib = require('../dist/index.js');

describe('spanish-adjectives-wrapper', function () {
  describe('#agreeSpanishAdjective()', function () {
    it(`no list`, function () {
      assert.equal(lib.agreeAdjective(null, 'negra', 'F', 'P'), 'negras');
    });
    it(`with list`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      grande['MStrue'] = 'toto';
      assert.equal(lib.agreeAdjective({ grande: grande }, 'grande', 'M', 'S', true), 'toto');
    });
    it(`with invalid list`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      delete grande['MStrue'];
      assert.throws(() => lib.agreeAdjective({ grande: grande }, 'grande', 'M', 'S', true), /dict/);
    });
  });
  describe('#getAdjectiveInfo()', function () {
    it(`gran`, function () {
      const grande = lib.getAdjectiveInfo('grande');
      // console.log(grande);
      assert.equal(grande['MStrue'], 'gran');
      assert.equal(grande['FPfalse'], 'grandes');
    });
  });
});
