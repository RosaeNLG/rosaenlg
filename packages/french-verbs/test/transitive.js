/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const FrenchVerbs = require('../dist/index.js');

const testCasesTransitif = [
  ['accuser', true],
  ['zondomiser', true],
  ['zoner', true],
  ['oindre', true],
  ['orner', true],
  ['obéir', true],
  ['monter', true],
  ['voltiger', false],
  ['batifoler', false],
];

describe('french-verbs', function () {
  describe('#isTransitive()', function () {
    for (let i = 0; i < testCasesTransitif.length; i++) {
      const testCase = testCasesTransitif[i];
      it(`${testCase[0]}`, function () {
        assert.strictEqual(FrenchVerbs.isTransitive(testCase[0]), testCase[1]);
      });
    }
  });
});
