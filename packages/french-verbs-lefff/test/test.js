/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const LefffVerbs = require('../dist/conjugations.json');

describe('french-verbs-lefff', function () {
  it('should contain something', function () {
    const mangerPresent = LefffVerbs['manger']['P'];
    assert(mangerPresent != null);
    assert.strictEqual(mangerPresent.length, 6);
    assert.strictEqual(mangerPresent[1], 'manges');
  });
});
