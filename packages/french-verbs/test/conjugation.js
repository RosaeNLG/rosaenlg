/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const FrenchVerbs = require('../dist/index.js');
const Lefff = require('french-verbs-lefff');

const testCasesConjugation = [
  ['est allée', { verb: 'aller', person: 2, gender: 'F', aux: 'ETRE', tense: 'PASSE_COMPOSE', agreeGender: 'F' }],
  ['finit', { verb: 'finir', person: 2, gender: 'M', tense: 'PRESENT' }],
  ['est', { verb: 'être', person: 2, gender: 'M', tense: 'PRESENT' }],
  ['sont', { verb: 'être', person: 5, gender: 'M', tense: 'PRESENT' }],
  ['oignent', { verb: 'oindre', person: 5, gender: 'M', tense: 'PRESENT' }],
  ['chantent', { verb: 'chanter', person: 5, gender: 'M', tense: 'PRESENT' }],
  ['vais', { verb: 'aller', person: 0, tense: 'PRESENT' }],
  ['vas', { verb: 'aller', person: 1, tense: 'PRESENT' }],
  ['boira', { verb: 'boire', person: 2, tense: 'FUTUR' }],
  ['prendront', { verb: 'prendre', person: 5, tense: 'FUTUR' }],
  ['firent', { verb: 'faire', person: 5, tense: 'PASSE_SIMPLE' }],
  ['a bu', { verb: 'boire', person: 2, tense: 'PASSE_COMPOSE', aux: 'AVOIR' }],
  ['ont été', { verb: 'être', person: 5, tense: 'PASSE_COMPOSE', aux: 'AVOIR' }],
  ['ont mangé', { verb: 'manger', person: 5, tense: 'PASSE_COMPOSE', aux: 'AVOIR' }],
  ['est allé', { verb: 'aller', person: 2, tense: 'PASSE_COMPOSE', aux: 'ETRE' }],
  ['avaient sorti', { verb: 'sortir', person: 5, tense: 'PLUS_QUE_PARFAIT', aux: 'AVOIR' }],
  [
    'étaient parties',
    { verb: 'partir', person: 5, tense: 'PLUS_QUE_PARFAIT', aux: 'ETRE', agreeGender: 'F', agreeNumber: 'P' },
  ],
  [
    'sont montés',
    { verb: 'monter', person: 5, tense: 'PASSE_COMPOSE', aux: 'ETRE', agreeGender: 'M', agreeNumber: 'P' },
  ],
  [
    'suis monté',
    { verb: 'monter', person: 0, tense: 'PASSE_COMPOSE', aux: 'ETRE', agreeGender: 'M', agreeNumber: 'S' },
  ],
  ['écrivez', { verb: 'écrire', person: 4, tense: 'PRESENT' }],

  ['se concentre', { verb: 'concentrer', person: 2, tense: 'PRESENT', pronominal: true }],
  ['se concentre', { verb: 'se concentrer', person: 2, tense: 'PRESENT' }],
  ['me concentre', { verb: 'concentrer', person: 0, tense: 'PRESENT', pronominal: true }],
  ['nous concentrons', { verb: 'concentrer', person: 3, tense: 'PRESENT', pronominal: true }],

  // auxiliaire automatique
  [
    "s'est marrée",
    { verb: 'marrer', person: 2, gender: 'F', tense: 'PASSE_COMPOSE', agreeGender: 'F', pronominal: true },
  ],
  ['est arrivé', { verb: 'arriver', person: 2, gender: 'M', tense: 'PASSE_COMPOSE' }],
  ['a mangé', { verb: 'manger', person: 2, gender: 'M', tense: 'PASSE_COMPOSE' }],

  // contraction / pronominal
  ["s'arrête", { verb: 'arrêter', person: 2, tense: 'PRESENT', pronominal: true }],
  ["m'arrête", { verb: 'arrêter', person: 0, tense: 'PRESENT', pronominal: true }],
  ['se gausse', { verb: 'gausser', person: 2, tense: 'PRESENT', pronominal: true }],
  ["s'écrie", { verb: 'écrier', person: 2, tense: 'PRESENT', pronominal: true }],
  ["s'écrie", { verb: 'se  écrier', person: 2, tense: 'PRESENT' }],
  ["s'hydrate", { verb: 'hydrater', person: 2, tense: 'PRESENT', pronominal: true }],
  ["s'hydrate", { verb: "s'hydrater", person: 2, tense: 'PRESENT' }],
  ['se hait', { verb: 'haïr', person: 2, tense: 'PRESENT', pronominal: true }],
  ['se haïssent', { verb: 'haïr', person: 5, tense: 'PRESENT', pronominal: true }],
  ["s'est haï", { verb: 'haïr', person: 2, tense: 'PASSE_COMPOSE', aux: 'ETRE', pronominal: true }],
  ["s'est haï", { verb: 'se haïr', person: 2, tense: 'PASSE_COMPOSE', aux: 'ETRE' }],
];

describe('french-verbs', function () {
  describe('#getConjugation()', function () {
    describe('nominal cases', function () {
      for (let i = 0; i < testCasesConjugation.length; i++) {
        const testCase = testCasesConjugation[i];
        const params = testCase[1];
        it(`${testCase[0]}`, function () {
          assert.strictEqual(
            FrenchVerbs.getConjugation(
              Lefff,
              params.verb,
              params.tense,
              params.person,
              params.aux,
              params.agreeGender,
              params.agreeNumber,
              params.pronominal,
            ),
            testCase[0],
          );
        });
      }
    });

    describe('local verb list', function () {
      const chanter = JSON.parse(JSON.stringify(FrenchVerbs.getVerbInfo(Lefff, 'chanter')));
      chanter['F'][2] = 'chantera tralalala';
      it(`changed verb locally`, function () {
        assert.strictEqual(
          FrenchVerbs.getConjugation({ chanter: chanter }, 'chanter', 'FUTUR', 2, null, null, null, null),
          'chantera tralalala',
        );
      });
    });

    describe('edge cases', function () {
      it(`aux not set`, function () {
        assert.throws(
          () => FrenchVerbs.getConjugation(Lefff, 'apostasier', 'PASSE_COMPOSE', 5, null, null, null, null),
          /aux/,
        );
      });
      it(`wrong aux`, function () {
        assert.throws(
          () =>
            FrenchVerbs.getConjugation(Lefff, 'manger', 'PASSE_COMPOSE', 2, 'ETRE_OU_NE_PAS_ETRE', null, null, null),
          /aux must be/,
        );
      });
      it(`no participe passé`, function () {
        assert.throws(
          () =>
            FrenchVerbs.getConjugation(
              Lefff,
              'paître', // ou gésir
              'PASSE_COMPOSE',
              2,
              'AVOIR',
              null,
              null,
              null,
            ),
          /participe/,
        );
      });
    });
    describe('defective verbs', function () {
      it(`defective verb on tense`, function () {
        assert.throws(() => FrenchVerbs.getConjugation(Lefff, 'quérir', 'FUTUR', 2, null, null, null, null), /tense/);
      });
      it(`defective verb on person`, function () {
        assert.throws(
          () => FrenchVerbs.getConjugation(Lefff, 'pleuvoir', 'PRESENT', 1, null, null, null, null),
          /person/,
        );
      });
    });
  });

  describe('#getVerbInfo()', function () {
    it(`chanter contains chantera`, function () {
      assert(JSON.stringify(FrenchVerbs.getVerbInfo(Lefff, 'chanter')).indexOf('chantera') > -1);
    });
  });
});
