/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const germanWords = require('../dist/words.json');

describe('german-words-dict', function () {
  it('has some content', function () {
    assert(germanWords != null);
    assert(Object.keys(germanWords).length > 100);
  });
  it('Kartoffeln are ok', function () {
    const kartoffel = germanWords['Kartoffel'];
    assert(kartoffel != null);
    assert.strictEqual(kartoffel['G'], 'F');
    assert.strictEqual(kartoffel['DAT']['PLU'], 'Kartoffeln');
  });
});
