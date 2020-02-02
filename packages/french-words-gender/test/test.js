const assert = require('assert');
const FrenchWordsLib = require('../dist/index.js');
const FrenchWordsLefff = require('french-words-gender-lefff');

const testCases = [
  ['homme', 'M'],
  ['femme', 'F'],
  ['Homme', 'M'],
];

describe('french-words-gender', function() {
  describe('#getGenderFrenchWord()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        it(`${testCase[0]}`, function() {
          assert.equal(FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, testCase[0]), testCase[1]);
        });
      }
    });

    describe('specific list', function() {
      it(`use specific list`, function() {
        assert.equal(FrenchWordsLib.getGenderFrenchWord({ opopopo: 'F' }, 'opopopo'), 'F');
      });
    });

    describe('edge', function() {
      it(`null word`, function() {
        assert.throws(() => FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, null), /not be null/);
      });
      it(`null list`, function() {
        assert.throws(() => FrenchWordsLib.getGenderFrenchWord(null, 'test'), /list/);
      });
      it(`word not found`, function() {
        assert.throws(() => FrenchWordsLib.getGenderFrenchWord(FrenchWordsLefff, 'xxxxYzz'), /dict/);
      });
    });
  });
});
