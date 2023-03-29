/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const EnglishIrregularVerbs = require('../dist/verbs.json');

describe('english-irregular-verbs', function () {
  it('sleep', function () {
    const sleep = EnglishIrregularVerbs['sleep'];
    assert(sleep != null);
    assert.strictEqual(sleep.length, 1);
    assert.strictEqual(sleep[0][0], 'slept');
    assert.strictEqual(sleep[0][1], 'slept');
  });
  it('wake', function () {
    const wake = EnglishIrregularVerbs['wake'];
    assert(wake != null);
    assert.strictEqual(wake.length, 2);
    assert.strictEqual(wake[0][0], 'woke');
    assert.strictEqual(wake[0][1], 'woken');
    assert.strictEqual(wake[1][0], 'waked');
    assert.strictEqual(wake[1][1], 'waked');
  });
  it('bid', function () {
    const bid = EnglishIrregularVerbs['bid'];
    assert(bid != null);
    assert.strictEqual(bid.length, 3);
  });
  it('shit', function () {
    const shit = EnglishIrregularVerbs['shit'];
    assert(shit != null);
    assert.strictEqual(shit.length, 3);
  });
  it('be', function () {
    const be = EnglishIrregularVerbs['be'];
    assert(be != null);
    assert.strictEqual(be.length, 2);
  });
});
