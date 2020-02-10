const assert = require('assert');
const lib = require('../dist/index.js');

const testCasesOrdinals = [
  [1, 'primo'],
  [66, 'sessantiseisimo'],
  [100, 'centesimo'],
  [1000, 'millesimo'],
  [1000000, 'millionesimo'],
];

describe('italian-ordinals-cardinals', function() {
  describe('#getOrdinal()', function() {
    for (let i = 0; i < testCasesOrdinals.length; i++) {
      const testCase = testCasesOrdinals[i];
      it(`${testCase[1]}`, function() {
        assert.equal(lib.getOrdinal(testCase[0]), testCase[1]);
      });
    }
    it(`out of bound`, function() {
      assert.throws(() => lib.getOrdinal(333), /found/);
    });
  });
});
