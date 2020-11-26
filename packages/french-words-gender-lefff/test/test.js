/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const FrenchWords = require('../dist/words.json');

const testCases = [
  ['homme', 'M'],
  ['femme', 'F'],
  ['blabla', 'M'],
  ['blablabla', 'M'],
  ['métro', 'M'],
  ['rame', 'F'],
  ['aller-retour', 'M'],
  ['autoroute', 'F'],
  ['bouffe', 'F'],
];

describe('french-words-gender-lefff', function () {
  describe('nominal', function () {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[0]}`, function () {
        assert.strictEqual(FrenchWords[testCase[0]], testCase[1]);
      });
    }
  });
});
