/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const lib = require('../dist/index.js');

const testCasesSimple = [
  ['breveté', 'F', 'S', 'brevetée'],
  ['muni', 'F', 'P', 'munies'],
  ['fabriqué', 'M', 'S', 'fabriqué'],
  ['luxueux', 'F', 'P', 'luxueuses'],
  ['rose', 'F', 'P', 'roses'],
  ['bleu', 'F', 'P', 'bleues'],
  ['vert', 'F', 'S', 'verte'],
  ['vairon', 'M', 'P', 'vairons'],
  ['orangé', 'F', 'P', 'orangées'],
  ['alezan', 'M', 'P', 'alezans'],
  ['blond', 'M', 'P', 'blonds'],
  ['châtain', 'F', 'P', 'châtains'],
  ['majeur', 'F', 'S', 'majeure'],
  ['rieur', 'F', 'S', 'rieuse'],
  ['vengeur', 'F', 'P', 'vengeresses'],
  ['créateur', 'F', 'S', 'créatrice'],
  ['aérien', 'F', 'S', 'aérienne'],
  ['annuel', 'F', 'S', 'annuelle'],
  ['bas', 'F', 'S', 'basse'],
  ['gentil', 'F', 'S', 'gentille'],
  ['net', 'F', 'S', 'nette'],
  ['meilleur', 'F', 'P', 'meilleures'],
  ['ambigu', 'F', 'S', 'ambiguë'],
  ['vermeil', 'F', 'S', 'vermeille'],
  ['oblong', 'F', 'P', 'oblongues'],
  ['rêveur', 'F', 'P', 'rêveuses'],
  ['corail', 'F', 'P', 'corail'],
  ['heureux', 'M', 'P', 'heureux'],
  ['heureux', 'F', 'P', 'heureuses'],
  ['royal', 'M', 'P', 'royaux'],
  ['vieux', 'F', 'S', 'vieille'],
  ['jeunot', 'F', 'P', 'jeunottes'],
  ['pâlot', 'F', 'S', 'pâlotte'],
  ['maison', 'F', 'P', 'maison'],
  ['vieux', 'M', 'S', 'vieux'],
  ['bleu', 'M', 'P', 'bleus'],
  ['natal', 'M', 'P', 'natals'],
  ['provisoire', 'F', 'S', 'provisoire'],
  ['futil', 'F', 'S', 'futile'],
  ['subtil', 'F', 'S', 'subtile'],
  // adjectif verbal
  ['fatigant', 'F', 'S', 'fatigante'],
  ['environnant', 'F', 'P', 'environnantes'],
  ['convaincant', 'M', 'S', 'convaincant'],
];

const testCasesWithNoun = [
  ['vieux', 'M', 'S', 'vieil', 'homme', true],
  ['fou', 'M', 'S', 'fol', 'homme', true],
  ['fou', 'F', 'S', 'folle', 'femme', true],
  ['fou', 'M', 'S', 'fou', 'homme', false],
  ['mou', 'M', 'S', 'mol', 'ectoplasme', true],
  ['vieux', 'M', 'S', 'vieil', 'imbécile', true],
  ['vieux', 'M', 'S', 'vieux', 'tricheur', true],
  ['vieux', 'M', 'S', 'vieil', 'alsacien', true],
  ['vieux', 'M', 'P', 'vieux', 'alsaciens', true],
  ['vieux', 'M', 'S', 'vieux', 'yaourt', true],
  ['vieux', 'M', 'S', 'vieil', 'ylang-ylang', true],
];

describe('french-adjectives', function () {
  describe('#agree()', function () {
    describe('simple', function () {
      testCasesSimple.forEach(function (testCase) {
        const root = testCase[0];
        const gender = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];

        it(`${root} ${gender} ${number} => ${expected}`, function () {
          assert.strictEqual(lib.agree(root, gender, number, null, null), expected);
        });
      });
    });

    describe('with noun', function () {
      testCasesWithNoun.forEach(function (testCase) {
        const root = testCase[0];
        const gender = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];
        const noun = testCase[4];
        const isBeforeNoun = testCase[5];

        it(`${noun} ${root} ${gender} ${number} => ${expected}`, function () {
          assert.strictEqual(lib.agree(root, gender, number, noun, isBeforeNoun), expected);
        });
      });
    });

    describe('contract override', function () {
      it(`vieil`, function () {
        assert.strictEqual(lib.agree('vieux', 'M', 'S', 'homme', true), 'vieil');
      });
      it(`vieux`, function () {
        assert.strictEqual(lib.agree('vieux', 'M', 'S', 'homme', true, { homme: { contracts: false } }), 'vieux');
      });
    });

    describe('edge cases', function () {
      it('invalid gender', () => assert.throws(() => lib.agree('breveté', 'X', 'S', null, null), /gender/));
      it('invalid number', () => assert.throws(() => lib.agree('breveté', 'F', 'X', null, null), /number/));
      it('noun required', () => assert.throws(() => lib.agree('breveté', 'F', 'S', null, true), /noun/));
    });
  });
  describe('#getChangeant()', function () {
    it(`vieil`, function () {
      assert.strictEqual(lib.getChangeant('vieux'), 'vieil');
    });
    it(`gros does not change`, function () {
      assert(!lib.getChangeant('gros'));
    });
  });
});
