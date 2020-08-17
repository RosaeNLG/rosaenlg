const assert = require('assert');
const lib = require('../dist/index.js');

describe('french-adjectives-wrapper', function () {
  describe('#getAdjectiveInfo()', function () {
    it('grand nominal', function () {
      const grand = lib.getAdjectiveInfo('grand');
      assert.equal(Object.keys(grand).length, 4);
      assert.equal(grand['FP'], 'grandes');
      assert.equal(grand['MP'], 'grands');
    });
    it('beau bel', function () {
      const beau = lib.getAdjectiveInfo('beau');
      assert.equal(Object.keys(beau).length, 5);
      assert.equal(beau['MS'], 'beau');
      assert.equal(beau['MP'], 'beaux');
      assert.equal(beau['FS'], 'belle');
      assert.equal(beau['FP'], 'belles');
      assert.equal(beau['beau'], 'bel');
    });
  });

  describe('#agreeAdjective()', function () {
    describe('nominal', function () {
      it('using function', function () {
        assert.equal(lib.agreeAdjective(null, 'vieux', 'M', 'S', 'homme', true), 'vieil');
      });
      describe('using list', function () {
        it('nominal grand', function () {
          const grand = lib.getAdjectiveInfo('grand');
          grand['FP'] = 'grandesX';
          assert.equal(lib.agreeAdjective({ grand: grand }, 'grand', 'F', 'P'), 'grandesX');
        });
        describe('vieux', function () {
          const vieux = lib.getAdjectiveInfo('vieux');
          it(`poires vieilles`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'F', 'P'), 'vieilles');
          });
          it(`escargot vieux`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', null, false), 'vieux');
          });
          it(`vieux schnock`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'schnock', true), 'vieux');
          });
          it(`vieil alsacien`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'alsacien', true), 'vieil');
          });
          it(`vieux yaourt`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'yaourt', true), 'vieux');
          });
          it(`vieux alsaciens`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'P', 'alsacien', true), 'vieux');
          });
          it(`vieil homme`, function () {
            assert.equal(lib.agreeAdjective({ vieux: vieux }, 'vieux', 'M', 'S', 'homme', true), 'vieil');
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
        assert.equal(lib.agreeAdjective({ grand: grand }, 'grand', 'F', 'P'), 'grandes');
      });
    });
  });
});
