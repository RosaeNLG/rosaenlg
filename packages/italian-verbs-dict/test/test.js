/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const italianVerbs = require('../dist/verbs.json');

describe('italian-verbs-dict', function () {
  it('must have some content', function () {
    assert(italianVerbs != null);
    assert(Object.keys(italianVerbs).length > 100);
  });

  it('mangiare', function () {
    const mangiare = italianVerbs['mangiare'];
    assert(mangiare != null);
    assert.strictEqual(mangiare['ind']['pres']['P1'], 'mangiamo');
  });

  it('abbacchiare', function () {
    const abbacchiare = italianVerbs['abbacchiare'];
    assert(abbacchiare != null);
    assert.strictEqual(abbacchiare['inf']['pres'], 'abbacchiare');
  });
});
