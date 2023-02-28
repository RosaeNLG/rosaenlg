/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  ['DEFINITE', 'M', 'S', null, null, 'le'],
  ['DEFINITE', 'F', 'S', null, null, 'la'],
  ['INDEFINITE', 'M', 'P', null, null, 'des'],
  ['DEMONSTRATIVE', 'F', 'S', null, null, 'cette'],
  ['DEMONSTRATIVE', null, 'P', null, null, 'ces'],

  ['POSSESSIVE', 'M', 'S', 'S', 3, 'son'],
  ['POSSESSIVE', 'F', 'S', 'S', 3, 'sa'],
  ['POSSESSIVE', 'F', 'S', 'P', 3, 'leur'],
  ['POSSESSIVE', 'F', 'P', 'S', 3, 'ses'],
  ['POSSESSIVE', 'M', 'P', 'P', 3, 'leurs'],

  ['POSSESSIVE', 'M', 'S', 'S', 1, 'mon', 1],
  ['POSSESSIVE', 'F', 'S', 'S', 1, 'ma', 1],
  ['POSSESSIVE', 'F', 'S', 'P', 1, 'notre', 1],
  ['POSSESSIVE', 'F', 'P', 'S', 1, 'mes', 1],
  ['POSSESSIVE', 'M', 'P', 'P', 1, 'nos', 1],

  ['POSSESSIVE', 'M', 'S', 'S', 2, 'ton'],
  ['POSSESSIVE', 'F', 'S', 'S', 2, 'ta'],
  ['POSSESSIVE', 'F', 'S', 'P', 2, 'votre'],
  ['POSSESSIVE', 'F', 'P', 'S', 2, 'tes'],
  ['POSSESSIVE', 'M', 'P', 'P', 2, 'vos'],
];

describe('french-determiners', function () {
  describe('#getDet()', function () {
    describe('nominal', function () {
      describe('classic', function () {
        testCases.forEach(function (testCase) {
          const detType = testCase[0];
          const genderOwned = testCase[1];
          const numberOwned = testCase[2];
          const numberOwner = testCase[3];
          const personOwner = testCase[4];
          const expected = testCase[5];

          it(`${detType} ${genderOwned} owned:${numberOwned} owner:${numberOwner} person:${personOwner} > ${expected}`, function () {
            assert.strictEqual(lib.getDet({ detType, genderOwned, numberOwned, numberOwner, personOwner }), expected);
          });
        });
        describe('de + adj', function () {
          it(`de bons restaurants`, function () {
            assert.strictEqual(
              lib.getDet({
                detType: 'INDEFINITE',
                genderOwned: 'M',
                numberOwned: 'P',
                adjectiveAfterDet: true,
                contentAfterDet: 'bons restaurants',
              }),
              'de',
            );
          });
          it(`des jeunes gens`, function () {
            assert.strictEqual(
              lib.getDet({
                detType: 'INDEFINITE',
                genderOwned: 'M',
                numberOwned: 'P',
                adjectiveAfterDet: true,
                contentAfterDet: 'jeunes gens',
              }),
              'des',
            );
          });
          it(`des bons restaurants`, function () {
            assert.strictEqual(
              lib.getDet({
                detType: 'INDEFINITE',
                genderOwned: 'M',
                numberOwned: 'P',
                adjectiveAfterDet: true,
                contentAfterDet: 'bons restaurants',
                forceDes: true,
              }),
              'des',
            );
          });
        });
      });
    });

    describe('edge cases', function () {
      it('invalid det type', () =>
        assert.throws(
          () =>
            lib.getDet({
              detType: 'blabla',
              genderOwned: 'M',
              numberOwned: 'S',
            }),
          /determiner/,
        ));
      it('invalid gender', () =>
        assert.throws(
          () =>
            lib.getDet({
              detType: 'DEFINITE',
              genderOwned: 'X',
              numberOwned: 'S',
            }),
          /gender/,
        ));
      it('invalid number', () =>
        assert.throws(
          () =>
            lib.getDet({
              detType: 'DEFINITE',
              genderOwned: 'M',
              numberOwned: 'X',
            }),
          /number/,
        ));
      it('missing owner number', () =>
        assert.throws(
          () =>
            lib.getDet({
              detType: 'POSSESSIVE',
              genderOwned: 'M',
              numberOwned: 'S',
              personOwner: 3,
            }),
          /number/,
        ));
      it('missing owner person', () =>
        assert.throws(
          () =>
            lib.getDet({
              detType: 'POSSESSIVE',
              genderOwned: 'M',
              numberOwned: 'S',
              numberOwner: 'S',
            }),
          /person/,
        ));
    });
  });
});

/*
  detType,
  genderOwned,
  numberOwned,
  numberOwner,
  adjectiveAfterDet,
  contentAfterDet,
  forceDes,
  personOwner,
  */
