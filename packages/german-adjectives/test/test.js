var assert = require('assert');
var GermanAdjectives = require('../dist/index.js');

const testCases = [
  [ 'alt', 'NOMINATIVE', 'M', 'S', 'DEFINITE', 'alte'],
  [ 'alt', 'DATIVE', 'N', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE', 'alten'],
];

describe('german-adjectives', function() {
  describe('#agreeGermanAdjective()', function() {
    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[0]}`, function() {
        assert.equal(
          GermanAdjectives.agreeGermanAdjective(testCase[0], testCase[1], testCase[2], testCase[3], testCase[4]),
          testCase[5]          
        )
      });
    }
  });
});
