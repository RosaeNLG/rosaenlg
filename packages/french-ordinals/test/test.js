var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [2, 'deuxième'],
  [67, 'soixante-septième'],
]

describe('french-ordinals', function() {
  describe('#getOrdinal()', function() {
    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[1]}`, function() {
        assert.equal( lib.getOrdinal(testCase[0]), testCase[1])
      });
    }

    it(`out of bound`, function() {
      assert.throws( () => lib.getOrdinal(333), /only/)
    });

  });
});
