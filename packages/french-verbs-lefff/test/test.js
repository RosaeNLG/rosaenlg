/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const LefffVerbs = require('../dist/conjugations.json');

describe('french-verbs-lefff', function () {
  it('should contain something - like "manger"', function () {
    const mangerPresent = LefffVerbs['manger']['P'];
    assert(mangerPresent != null);
    assert.strictEqual(mangerPresent.length, 6);
    assert.strictEqual(mangerPresent[1], 'manges');
  });
  it('should contain something - like "vouloir"', function () {
    const vouloirImpératif = LefffVerbs['vouloir']['Y'];
    assert(vouloirImpératif != null);
    assert.strictEqual(vouloirImpératif.length, 6);
    assert.strictEqual(vouloirImpératif[1], 'veuille');
  });
  it('"pacser" must work', function () {
    const pacserVerb = LefffVerbs['pacser'];
    assert(pacserVerb != null);
    const pacserPresent = pacserVerb['P'];
    assert(pacserPresent != null);
    assert.strictEqual(pacserPresent[1], 'pacses');
  });
});
