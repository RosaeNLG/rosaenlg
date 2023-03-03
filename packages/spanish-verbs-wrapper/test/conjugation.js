/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

describe('spanish-verbs-wrapper', function () {
  describe('#getConjugation()', function () {
    it(`nominal with conj function`, function () {
      assert.strictEqual(lib.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 2), 'habla');
    });
    it(`nominal with verbs list`, function () {
      const verbsInfo = {
        hablar: lib.getVerbInfo('hablar'),
        poder: lib.getVerbInfo('poder'),
      };
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 0), 'hablo');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 1), 'hablas');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 2), 'habla');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 3), 'hablamos');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 4), 'habláis');
      assert.strictEqual(lib.getConjugation(verbsInfo, 'hablar', 'INDICATIVE_PRESENT', 5), 'hablan');

      assert.strictEqual(lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_FUTURE_PERFECT', 5), 'habrán podido');
    });
    describe('edge cases', function () {
      it(`no verb`, function () {
        assert.throws(() => lib.getConjugation(null, null, 'INDICATIVE_PRESENT', 2), /verb/);
      });
      it(`invalid person`, function () {
        assert.throws(() => lib.getConjugation(null, 'hablar', 'INDICATIVE_PRESENT', 36), /person must be/);
      });
      it(`invalid tense`, function () {
        assert.throws(() => lib.getConjugation(null, 'hablar', 'INDICATIVE_BLABLA', 2), /tense/);
      });

      describe('list issues', function () {
        it(`verb not in list`, function () {
          const verbsInfo = {
            hablar: lib.getVerbInfo('hablar'),
          };
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 2), /not found in list/);
        });
        it(`tense not found`, function () {
          const verbsInfo = {
            poder: lib.getVerbInfo('poder'),
          };
          delete verbsInfo['poder']['INDICATIVE_PRESENT'];
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 2), /tense/);
        });
        it(`person not found`, function () {
          const verbsInfo = {
            poder: lib.getVerbInfo('poder'),
          };
          delete verbsInfo['poder']['INDICATIVE_PRESENT']['2'];
          assert.throws(() => lib.getConjugation(verbsInfo, 'poder', 'INDICATIVE_PRESENT', 2), /person/);
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
    it(`verb hablar, on 0, 1`, function () {
      const verbInfo = lib.getVerbInfo('hablar');
      assert.strictEqual(verbInfo['INDICATIVE_PRESENT']['0'], 'hablo');
      assert.strictEqual(verbInfo['INDICATIVE_PRESENT']['1'], 'hablas');
    });
  });
});
