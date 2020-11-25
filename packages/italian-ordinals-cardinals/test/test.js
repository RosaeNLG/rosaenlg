/**
 * @license
 * Copyright 2020, Marco Riva, 2019, Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

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
  [1000000000, 'miliardesimo'],
];

const testCasesOrdinalsFemale = [
  [1, 'prima'],
  [5, 'quinta'],
  [21, 'ventunesima'],
  [23, 'ventitreesima'],
  [61, 'sessantunesima'],
  [66, 'sessantaseiesima'],
  [100, 'centesima'],
  [385, 'trecentottantacinquesima'],
  [1000, 'millesima'],
  [1131, 'millecentotrentunesima'],
  [1234, 'milleduecentotrentaquattresima'],
  [1456, 'millequattrocentocinquantaseiesima'],
  [1621, 'milleseicentoventunesima'],
  [9453, 'novemilaquattrocentocinquantatreesima'],
  [20000, 'ventimillesima'],
  [31298, 'trentunomiladuecentonovantottesima'],
  [141232, 'centoquarantunomiladuecentotrentaduesima'],
  [641221, 'seicentoquarantunomiladuecentoventunesima'],
  [954322, 'novecentocinquantaquattromilatrecentoventiduesima'],
  [1000000, 'milionesima'],
  [1000000000, 'miliardesima'],
];

describe('italian-ordinals-cardinals', function () {
  describe('#getOrdinal()', function () {
    for (let i = 0; i < testCasesOrdinals.length; i++) {
      const testCase = testCasesOrdinals[i];
      it(`${testCase[1]}`, function () {
        assert.strictEqual(lib.getOrdinal(testCase[0]), testCase[1]);
      });
    }
    for (let i = 0; i < testCasesOrdinalsFemale.length; i++) {
      const testCase = testCasesOrdinalsFemale[i];
      it(`${testCase[1]}`, function () {
        assert.strictEqual(lib.getOrdinal(testCase[0], 'F'), testCase[1]);
      });
    }
    it(`out of bound`, function () {
      assert.throws(() => lib.getOrdinal(1000770), /found/);
    });
  });
});
