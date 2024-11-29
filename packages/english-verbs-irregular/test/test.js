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
  it('all have 2', function () {
    for (const verb in EnglishIrregularVerbs) {
      assert.strictEqual(EnglishIrregularVerbs[verb][0].length, 2, verb);
    }
  });

  it('sometimes the consonant is doubled', function () {
    const doubledList = [
      ['ship', 'shipped'],
      ['stop', 'stopped'],
      ['plan', 'planned'],
      ['tip', 'tipped'],
      ['cram', 'crammed'],
      ['regret', 'regretted'],
      ['wrap', 'wrapped'],
    ];
    for (let doubled of doubledList) {
      const name = doubled[0];
      const verb = EnglishIrregularVerbs[name];
      assert(verb != null, `<${name}> is not in the list while it should`);
      const preterit = verb[0][1];
      assert.strictEqual(preterit, doubled[1], `for <${name}>`);
    }
  });

  it('sometimes the consonant is NOT doubled', function () {
    const notDoubledList = ['shift', 'vote', 'instruct', 'listen', 'ruin', 'seat', 'fool'];
    for (let notDoubled of notDoubledList) {
      const verb = EnglishIrregularVerbs[notDoubled];
      if (verb == null) {
        continue;
      } else {
        const preterit = verb[0][1] + 'ed';
        assert.strictEqual(preterit, notDoubled, notDoubled);
      }
    }
  });
});
