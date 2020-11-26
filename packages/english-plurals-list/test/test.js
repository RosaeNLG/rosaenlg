/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishPlurals = require('../dist/plurals.json');

const testCasesPlural = [
  ['cactus', 'cacti'],
  ['phenomenon', 'phenomena'],
  ['tomato', 'tomatoes'],
  ['wolf', 'wolves'],
];

describe('english-plurals-list', function () {
  for (let i = 0; i < testCasesPlural.length; i++) {
    const testCase = testCasesPlural[i];
    const singular = testCase[0];
    const expected = testCase[1];
    it(`${singular} => ${expected}`, function () {
      assert.strictEqual(EnglishPlurals[singular], expected);
    });
  }
  it(`brother was removed`, function () {
    assert(EnglishPlurals['brother'] == null);
  });
});
