const assert = require('assert');
const lib = require('../dist/index.js');

describe('spanish-verbs-wrapper', function () {
  describe('#getConjugation()', function () {
    it(`nominal with conj function`, function () {
      assert.strictEqual(lib.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 'S'), 'habla');
    });
    it(`nominal with verbs list`, function () {
      const verbsInfo = {
        hablar: lib.getVerbInfo('hablar'),
        poder: lib.getVerbInfo('poder'),
      };
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 'S'), 'habla');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_FUTURE_PERFECT', 'P'), 'habrán podido');
    });
    describe('edge cases', function () {
      it(`no verb`, function () {
        assert.throws(() => lib.getConjugation(null, null, 'INDICATIVE_PRESENT', 'S'), /verb/);
      });
      it(`invalid person`, function () {
        assert.throws(() => lib.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 36), /number/);
      });
      it(`invalid tense`, function () {
        assert.throws(() => lib.getConjugation(null, 'hablar', 'INDICATIVE_BLABLA', 'S'), /tense/);
      });

      describe('list issues', function () {
        it(`verb not in list`, function () {
          const verbsInfo = {
            hablar: lib.getVerbInfo('hablar'),
          };
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 'S'), /not found in list/);
        });
        it(`tense not found`, function () {
          const verbsInfo = {
            poder: lib.getVerbInfo('poder'),
          };
          delete verbsInfo['poder']['INDICATIVE_PRESENT'];
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 'S'), /tense/);
        });
        it(`person not found`, function () {
          const verbsInfo = {
            poder: lib.getVerbInfo('poder'),
          };
          delete verbsInfo['poder']['INDICATIVE_PRESENT']['2'];
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 'S'), /person/);
        });
      });
    });
  });

  describe('#getVerbInfo()', function () {
    it(`irregular verb poder`, function () {
      const verbInfo = lib.getVerbInfo('poder');
      assert.strictEqual(verbInfo['INDICATIVE_PRESENT']['5'], 'pueden');
      assert.strictEqual(verbInfo['INDICATIVE_FUTURE']['2'], 'podrá');
      assert.strictEqual(verbInfo['INDICATIVE_FUTURE_PERFECT']['5'], 'habrán podido');
      assert.strictEqual(verbInfo['SUBJUNCTIVE_FUTURE_PERFECT']['2'], 'hubiere podido');
    });
    it(`regular verb poseer`, function () {
      const verbInfo = lib.getVerbInfo('poseer');
      assert.strictEqual(verbInfo['INDICATIVE_IMPERFECT']['2'], 'poseía');
      assert.strictEqual(verbInfo['INDICATIVE_PRETERITE']['5'], 'poseyeron');
    });
  });
});
