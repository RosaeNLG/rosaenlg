var lib = require('../dist/index.js');
var assert = require('assert');

const testCases = [
  [2, 'zweite'],
  [21, 'einundzwanzigste'],
]

describe('german-ordinals', function() {
  describe('#getOrdinal()', function() {

    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[1]}`, function() {
        assert.equal( lib.getOrdinal(testCase[0]), testCase[1] )
      });
    }

    it(`too large`, function() {
      assert.throws( () => lib.getOrdinal(121), /bound/)
    });

  });
});

