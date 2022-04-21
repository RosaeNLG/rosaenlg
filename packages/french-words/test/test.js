/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const FrenchWordsLib = require('../dist/index.js');
const FrenchWordsLefff = require('french-words-gender-lefff/dist/words.json');

const testCasesGender = [
  ['homme', 'M'],
  ['femme', 'F'],
  ['Homme', 'M'],
];

const testCasesPlural = [
  ['homme', 'hommes'],
  ['genou', 'genoux'],
  ['cas', 'cas'],
  ['aaa', 'aaas'],
];

describe('french-words', function () {
  describe('#getPlural()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesPlural.length; i++) {
        const testCase = testCasesPlural[i];
        it(`${testCase[0]}`, function () {
          assert.strictEqual(FrenchWordsLib.getPlural(null, testCase[0]), testCase[1]);
        });
      }
    });

    describe('specific list', function () {
      it(`embedded`, function () {
        assert.strictEqual(FrenchWordsLib.getPlural({ popo: { plural: 'popox' } }, 'popo'), 'popox');
      });
    });

    describe('edge', function () {
      it(`null word`, function () {
        assert.throws(() => FrenchWordsLib.getPlural(null, null), /word/);
      });
    });
  });

  describe('#getGender()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesGender.length; i++) {
        const testCase = testCasesGender[i];
        it(`${testCase[0]}`, function () {
          assert.strictEqual(FrenchWordsLib.getGender(null, FrenchWordsLefff, testCase[0]), testCase[1]);
        });
      }
    });

    describe('specific list', function () {
      it(`other than Lefff`, function () {
        assert.strictEqual(FrenchWordsLib.getGender(null, { opopopo: 'F' }, 'opopopo'), 'F');
      });
      it(`embedded`, function () {
        assert.strictEqual(FrenchWordsLib.getGender({ opopopo: { gender: 'F' } }, null, 'opopopo'), 'F');
      });
    });

    describe('edge', function () {
      it(`null word`, function () {
        assert.throws(() => FrenchWordsLib.getGender(null, FrenchWordsLefff, null), /not be null/);
      });
      it(`both list null`, function () {
        assert.throws(() => FrenchWordsLib.getGender(null, null, 'test'), /either/);
      });
      it(`word not found in Lefff`, function () {
        assert.throws(() => FrenchWordsLib.getGender(null, FrenchWordsLefff, 'xxxxYzz'), /not found/);
      });
      it(`word is a gender`, function () {
        assert.throws(() => FrenchWordsLib.getGender(null, FrenchWordsLefff, 'F'), /object that has a gender/);
      });
      it(`word not found in specific list`, function () {
        assert.throws(() => FrenchWordsLib.getGender({ opopopo: { gender: 'F' } }, null, 'xxxxYzz'), /not found/);
      });
    });
  });

  describe('#getWordInfo()', function () {
    it(`should work`, function () {
      const genou = FrenchWordsLib.getWordInfo(FrenchWordsLefff, 'genou');
      assert.strictEqual(genou.gender, 'M');
      assert.strictEqual(genou.plural, 'genoux');
    });
  });
});
