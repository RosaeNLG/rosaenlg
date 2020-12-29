/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  ['DEFINITE', 'M', 'S', null, 'le'],
  ['DEFINITE', 'F', 'S', null, 'la'],
  ['INDEFINITE', 'M', 'P', null, 'des'],
  ['DEMONSTRATIVE', 'F', 'S', null, 'cette'],
  ['DEMONSTRATIVE', null, 'P', null, 'ces'],

  ['POSSESSIVE', 'M', 'S', 'S', 'son'],
  ['POSSESSIVE', 'F', 'S', 'S', 'sa'],
  ['POSSESSIVE', 'F', 'S', 'P', 'leur'],
  ['POSSESSIVE', 'F', 'P', 'S', 'ses'],
  ['POSSESSIVE', 'M', 'P', 'P', 'leurs'],
];

describe('french-determiners', function () {
  describe('#getDet()', function () {
    describe('nominal', function () {
      describe('classic', function () {
        testCases.forEach(function (testCase) {
          const detType = testCase[0];
          const gender = testCase[1];
          const numberOwned = testCase[2];
          const numberOwner = testCase[3];
          const expected = testCase[4];

          it(`${detType} ${gender} owned:${numberOwned} owner:${numberOwner} => ${expected}`, function () {
            assert.strictEqual(lib.getDet(detType, gender, numberOwned, numberOwner, null, null, null), expected);
          });
        });
        describe('de + adj', function () {
          it(`de bons restaurants`, function () {
            assert.strictEqual(lib.getDet('INDEFINITE', 'M', 'P', null, true, 'bons restaurants', null), 'de');
          });
          it(`des jeunes gens`, function () {
            assert.strictEqual(lib.getDet('INDEFINITE', 'M', 'P', null, true, 'jeunes gens', null), 'des');
          });
          it(`des bons restaurants`, function () {
            assert.strictEqual(lib.getDet('INDEFINITE', 'M', 'P', null, true, 'bons restaurants', true), 'des');
          });
        });
      });
    });

    describe('edge cases', function () {
      it('invalid det type', () =>
        assert.throws(() => lib.getDet('blabla', 'M', 'S', null, null, null, null), /determiner/));
      it('invalid gender', () =>
        assert.throws(() => lib.getDet('DEFINITE', 'X', 'S', null, null, null, null), /gender/));
      it('invalid number', () =>
        assert.throws(() => lib.getDet('DEFINITE', 'M', 'X', null, null, null, null), /number/));
      it('missing owner number', () =>
        assert.throws(() => lib.getDet('POSSESSIVE', 'M', 'S', null, null, null, null), /number/));
    });
  });
});
