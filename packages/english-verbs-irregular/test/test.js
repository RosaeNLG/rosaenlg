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
    assert.strictEqual('slept', sleep[0][0]);
    assert.strictEqual('slept', sleep[0][1]);
  });
  it('wake', function () {
    const wake = EnglishIrregularVerbs['wake'];
    assert(wake != null);
    assert.strictEqual(wake.length, 2);
    assert.strictEqual('woke', wake[0][0]);
    assert.strictEqual('woken', wake[0][1]);
    assert.strictEqual('waked', wake[1][0]);
    assert.strictEqual('waked', wake[1][1]);
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
});
