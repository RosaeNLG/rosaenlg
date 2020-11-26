/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const FrenchVerbs = require('../dist/index.js');
const Lefff = require('french-verbs-lefff');

describe('french-verbs', function () {
  describe('#getConjugation()', function () {
    it(`null verb`, function () {
      assert.throws(() => FrenchVerbs.getConjugation(Lefff, null, null, null, null, null, null, null), /verb/);
    });
    it(`null list`, function () {
      assert.throws(() => FrenchVerbs.getConjugation(null, 'manger', 'PRESENT', 1, null, null, null, null), /list/);
    });
    it(`null person`, function () {
      assert.throws(
        () => FrenchVerbs.getConjugation(Lefff, 'manger', 'PRESENT', null, null, null, null, null),
        /person/,
      );
    });
    it(`invalid tense`, function () {
      assert.throws(() => FrenchVerbs.getConjugation(Lefff, 'manger', 'blabla', 1, null, null, null, null), /tense/);
    });
    it(`verb not in dict`, function () {
      assert.throws(
        () => FrenchVerbs.getConjugation(Lefff, 'farfouillasser', 'PRESENT', 1, null, null, null, null),
        /dict/,
      );
    });
  });
});
