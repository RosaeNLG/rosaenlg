var assert = require('assert');
var FrenchVerbs = require('../dist/index.js');

const testCasesIntransitif = [['voleter', true], ['ambiancer', true], ['manger', false]];

describe('french-verbs', function() {
  describe('#isIntransitive()', function() {
    for (var i = 0; i < testCasesIntransitif.length; i++) {
      const testCase = testCasesIntransitif[i];
      it(`${testCase[0]}`, function() {
        assert.equal(FrenchVerbs.isIntransitive(testCase[0]), testCase[1]);
      });
    }
  });
});
