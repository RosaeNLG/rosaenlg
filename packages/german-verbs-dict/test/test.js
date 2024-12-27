/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const germanVerbs = require('../dist/verbs.json');

describe('german-verbs-dict', function () {
  it('should work', function (done) {
    assert(germanVerbs != null);
    assert(Object.keys(germanVerbs).length > 100);
    const horen = germanVerbs['hören'];
    assert(horen != null);
    assert.strictEqual(horen['PRT']['S'][1], 'hörte');
    done();
  });
  it('verb with prefix', function (done) {
    const durchschauen = germanVerbs['durchschauen'];
    assert(durchschauen.hasPrefix);
    const s1 = durchschauen['PRÄ']['S'][1];
    assert.strictEqual(s1[0], 'schaue');
    assert.strictEqual(s1[1], 'durch');
    done();
  });
});
