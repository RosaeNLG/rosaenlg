const assert = require('assert');
const lib = require('../dist/index.js');

describe('french-adjectives-wrapper', function () {
  describe('#getAdjectiveInfo()', function () {
    it('grand nominal', function () {
      const grand = lib.getAdjectiveInfo('grand');
      assert.strictEqual(Object.keys(grand).length, 4);
      assert.strictEqual(grand['FP'], 'grandes');
      assert.strictEqual(grand['MP'], 'grands');
    });
    it('beau bel', function () {
      const beau = lib.getAdjectiveInfo('beau');
      assert.strictEqual(Object.keys(beau).length, 5);
      assert.strictEqual(beau['MS'], 'beau');
      assert.strictEqual(beau['MP'], 'beaux');
      assert.strictEqual(beau['FS'], 'belle');
      assert.strictEqual(beau['FP'], 'belles');
      assert.strictEqual(beau['beau'], 'bel');
    });
  });

  describe('#agreeAdjective()', function () {
    describe('nominal', function () {
      it('using function', function () {
        assert.strictEqual(lib.agreeAdjective(null, 'vieux', 'M', 'S', 'homme', true), 'vieil');
      });
      describe('using list', function () {
        it('nominal grand', function () {
          const grand = lib.getAdjectiveInfo('grand');
          grand['FP'] = 'grandesX';
          assert.strictEqual(lib.agreeAdjective({ grand: grand }, 'grand', 'F', 'P'), 'grandesX');
        });
        describe('vieux', function () {
          const vieux = lib.getAdjectiveInfo('vieux');
          it(`poires vieilles`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'F', 'P'), 'vieilles');
          });
          it(`escargot vieux`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', null, false), 'vieux');
          });
          it(`vieux schnock`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'schnock', true), 'vieux');
          });
          it(`vieil alsacien`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'alsacien', true), 'vieil');
          });
          it(`vieux yaourt`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'yaourt', true), 'vieux');
          });
          it(`vieux alsaciens`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'P', 'alsacien', true), 'vieux');
          });
          it(`vieil homme`, function () {
            assert.strictEqual(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'homme', true), 'vieil');
          });
        });
      });
    });
    describe('edge cases', function () {
      it('invalid gender', () =>
        assert.throws(() => lib.agreeAdjective(null, 'breveté', 'X', 'S', null, null), /gender/));
      it('invalid number', () =>
        assert.throws(() => lib.agreeAdjective(null, 'breveté', 'F', 'X', null, null), /number/));
      it('noun required', () => assert.throws(() => lib.agreeAdjective(null, 'breveté', 'F', 'S', null, true), /noun/));
      it('incomplete adj info', function () {
        const grand = lib.getAdjectiveInfo('grand');
        delete grand['FP'];
        assert.strictEqual(lib.agreeAdjective({ grand: grand }, 'grand', 'F', 'P'), 'grandes');
      });
    });
  });
});
