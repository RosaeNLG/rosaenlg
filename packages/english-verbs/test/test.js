const assert = require('assert');
const EnglishVerbs = require('../dist/index.js');

const testCases = [
  ['eat', 'PRESENT', 'S', 'eats'],
  ['eat', 'PRESENT', 'P', 'eat'],
];

describe('english-verbs', function() {
  describe('#getConjugation()', function() {
    describe('nominal cases', function() {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const verb = testCase[0];
        const tense = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];
        it(`${verb} ${tense} ${number} => ${expected}`, function() {
          assert.equal(EnglishVerbs.getConjugation(verb, tense, number), expected);
        });
      }
    });
  });
});
