const assert = require('assert');
const lib = require('../dist/index.js');

const testCasesOrdinals = [
  [1, 'primo'],
  [5, 'quinto'],
  [21, 'ventunesimo'],
  [23, 'ventitreesimo'],
  [61, 'sessantunesimo'],
  [66, 'sessantaseiesimo'],
  [100, 'centesimo'],
  [385, 'trecentottantacinquesimo'],
  [1000, 'millesimo'],
  [1131, 'millecentotrentunesimo'],
  [1234, 'milleduecentotrentaquattresimo'],
  [1456, 'millequattrocentocinquantaseiesimo'],
  [1621, 'milleseicentoventunesimo'],
  [9453, 'novemilaquattrocentocinquantatreesimo'],
  [20000, 'ventimillesimo'],
  [31298, 'trentunomiladuecentonovantottesimo'],
  [141232, 'centoquarantunomiladuecentotrentaduesimo'],
  [641221, 'seicentoquarantunomiladuecentoventunesimo'],
  [954322, 'novecentocinquantaquattromilatrecentoventiduesimo'],
  [1000000, 'milionesimo'],
  [1000000000, 'miliardesimo']
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
      assert.throws(() => lib.getOrdinal(1000770), /found/);
    });
  });
});
