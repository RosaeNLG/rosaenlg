/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  [2, 'M', 'deuxième'],
  [67, null, 'soixante-septième'],
  [1, 'M', 'premier'],
  [1, null, 'premier'],
  [1, 'F', 'première'],
  [100, null, 'centième'],
];

describe('french-ordinals', function () {
  describe('#getOrdinal()', function () {

    
    describe('nominal', function () {
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const num = testCase[0];
        const gender = testCase[1];
        const expected = testCase[2];
        it(`${num}, ${gender} => ${expected}`, function () {
          assert.strictEqual(lib.getOrdinal(num, gender), expected);
        });
      }
    });

    describe('edge', function () {
      it(`out of bound`, function () {
        assert.throws(() => lib.getOrdinal(333), /only/);
      });
    });
  });
});
