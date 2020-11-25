/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const italianAdjectives = require('../dist/adjectives.json');

describe('italian-adjectives-dict', function () {
  it('should work', function (done) {
    assert(italianAdjectives != null);
    assert(Object.keys(italianAdjectives).length > 100);
    const azzurro = italianAdjectives['azzurro'];
    assert(azzurro != null);
    assert.strictEqual(azzurro['FP'], 'azzurre');
    done();
  });
});
