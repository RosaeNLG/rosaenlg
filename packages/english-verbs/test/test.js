const assert = require('assert');
const EnglishVerbs = require('../dist/index.js');

const testCases = {
  // SIMPLE
  PRESENT: [
    ['eat', 'S', 'eats'],
    ['eat', 'P', 'eat'],
    ['listen', 'S', 'listens'],
    // irregular
    ['fly', 'S', 'flies'],
    ['play', 'S', 'plays'],
    ['go', 'S', 'goes'],
    ['do', 'S', 'does'],
    ['have', 'S', 'has'],
    ['be', 'S', 'is'],
    ['be', 'P', 'are'],
    ['pass', 'S', 'passes'],
    ['catch', 'S', 'catches'],
    ['fix', 'S', 'fixes'],
    ['push', 'S', 'pushes'],
    ['can', 'S', 'can'],
  ],
  SIMPLE_PRESENT: [['snow', 'S', 'snows']],
};

describe('english-verbs', function() {
  describe('#getConjugation()', function() {
    describe('nominal cases', function() {
      const tenses = Object.keys(testCases);
      for (let i = 0; i < tenses.length; i++) {
        const tense = tenses[i];
        describe(tense, function() {
          for (let j = 0; j < testCases[tense].length; j++) {
            const testCase = testCases[tense][j];
            const verb = testCase[0];
            const number = testCase[1];
            const expected = testCase[2];
            it(`${verb} ${tense} ${number} => ${expected}`, function() {
              assert.equal(EnglishVerbs.getConjugation(verb, tense, number), expected);
            });
          }
        });
      }
    });
  });
});
