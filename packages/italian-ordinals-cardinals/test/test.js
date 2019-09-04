var assert = require('assert');
var lib = require('../dist/index.js');

const testCasesOrdinals = [
  [1, 'primo'],
  [66, 'sessantiseisimo'],
  [100, 'centesimo'],
  [1000, 'millesimo'],
  [1000000, 'millionesimo'],
];

const testCasesCardinals = [
  [1, 'uno'],
  [26, 'ventisei'],
  [29, 'ventinove'],
  [100, 'cento'],
  [1000, 'mille'],
  [1000000, 'un milione'],
];

describe('italian-ordinals-cardinals', function() {
  describe('#getOrdinal()', function() {
    for (var i = 0; i < testCasesOrdinals.length; i++) {
      const testCase = testCasesOrdinals[i];
      it(`${testCase[1]}`, function() {
        assert.equal(lib.getOrdinal(testCase[0]), testCase[1]);
      });
    }
    it(`out of bound`, function() {
      assert.throws(() => lib.getOrdinal(333), /found/);
    });
  });
  describe('#getCardinal()', function() {
    for (var i = 0; i < testCasesCardinals.length; i++) {
      const testCase = testCasesCardinals[i];
      it(`${testCase[1]}`, function() {
        assert.equal(lib.getCardinal(testCase[0]), testCase[1]);
      });
    }
    it(`out of bound`, function() {
      assert.throws(() => lib.getCardinal(333), /found/);
    });
  });
});
