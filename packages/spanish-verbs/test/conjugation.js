/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const SpanishVerbs = require('../dist/index.js');

// TODO put more tests
const testCasesConjugation = [['hablar', 'INDICATIVE_PRESENT', 2, 'habla']];

describe('spanish-verbs', function () {
  describe('#getConjugation()', function () {
    describe('nominal cases', function () {
      for (let i = 0; i < testCasesConjugation.length; i++) {
        const testCase = testCasesConjugation[i];
        it(`${testCase[0]} ${testCase[1]} ${testCase[2]} => ${testCase[3]}`, function () {
          assert.strictEqual(SpanishVerbs.getConjugation(testCase[0], testCase[1], testCase[2]), testCase[3]);
        });
      }
    });
    describe('edge cases', function () {
      it(`no verb`, function () {
        assert.throws(() => SpanishVerbs.getConjugation(null, 'INDICATIVE_PRESENT', 2), /verb/);
      });
      it(`wrong person`, function () {
        assert.throws(() => SpanishVerbs.getConjugation('hablar', 'INDICATIVE_PRESENT', 36), /person/);
      });
      it(`wrong tense`, function () {
        assert.throws(() => SpanishVerbs.getConjugation('hablar', 'INDICATIVE_SOMETHING', 2), /tense/);
      });
    });
  });
});
