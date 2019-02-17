var assert = require('assert');
var FrenchWords = require('../dist/index.js');

const testCases = [
  [ 'homme', 'M'],
  [ 'femme', 'F'],
  [ 'blabla', 'M'],
  [ 'blablabla', 'M'],
  [ 'métro', 'M'],
  [ 'rame', 'F'],
  [ 'aller-retour', 'M'],
  [ 'autoroute', 'F'],
  [ 'bouffe', 'F'],
];

describe('french-words-gender', function() {
  describe('#getGenderFrenchWord()', function() {
    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[0]}`, function() {
        assert.equal( FrenchWords.getGenderFrenchWord(testCase[0]), testCase[1])
      });
    }
  });
});

