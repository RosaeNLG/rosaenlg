var assert = require('assert');
var FrenchWords = require('../dist/index.js');

const testCases = [
  ['homme', 'M'],
  ['femme', 'F'],
  ['blabla', 'M'],
  ['blablabla', 'M'],
  ['métro', 'M'],
  ['rame', 'F'],
  ['aller-retour', 'M'],
  ['autoroute', 'F'],
  ['bouffe', 'F'],
  ['Homme', 'M'],
];

describe('french-words-gender', function() {
  describe('#getGenderFrenchWord()', function() {
    describe('nominal', function() {
      for (var i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        it(`${testCase[0]}`, function() {
          assert.equal(FrenchWords.getGenderFrenchWord(testCase[0]), testCase[1]);
        });
      }
    });

    describe('specific list', function() {
      it(`use specific list`, function() {
        assert.equal(FrenchWords.getGenderFrenchWord('opopopo', { opopopo: 'F' }), 'F');
      });

      it(`use fallback list`, function() {
        assert.equal(FrenchWords.getGenderFrenchWord('femme', { opopopo: 'F' }), 'F');
      });

      it(`overrides`, function() {
        assert.equal(FrenchWords.getGenderFrenchWord('femme', { femme: 'M' }), 'M');
      });
    });

    describe('edge', function() {
      it(`null word`, function() {
        assert.throws(() => FrenchWords.getGenderFrenchWord(null), /not be null/);
      });
      it(`word not found`, function() {
        assert.throws(() => FrenchWords.getGenderFrenchWord('xxxxYzz'), /dict/);
      });
    });
  });
});
