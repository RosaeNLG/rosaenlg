/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const SpanishAdjectives = require('../dist/index.js');

const testCasesClassic = [
  ['negro', 'M', 'S', 'negro'],
  ['negro', 'F', 'S', 'negra'],
  ['negro', 'M', 'P', 'negros'],
  ['negro', 'F', 'P', 'negras'],
  ['interesante', 'M', 'S', 'interesante'],
  ['interesante', 'F', 'S', 'interesante'],
  ['interesante', 'M', 'P', 'interesantes'],
  ['interesante', 'F', 'P', 'interesantes'],
  ['idealista', 'M', 'S', 'idealista'],
  ['idealista', 'F', 'S', 'idealista'],
  ['idealista', 'M', 'P', 'idealistas'],
  ['idealista', 'F', 'P', 'idealistas'],
  ['fácil', 'M', 'S', 'fácil'],
  ['fácil', 'F', 'P', 'fáciles'],
  ['feliz', 'M', 'S', 'feliz'],
  ['feliz', 'F', 'S', 'feliz'],
  ['feliz', 'F', 'P', 'felices'],
  ['trabajador', 'M', 'S', 'trabajador'],
  ['trabajador', 'F', 'S', 'trabajadora'],
  ['trabajador', 'M', 'P', 'trabajadores'],
  ['trabajador', 'F', 'P', 'trabajadoras'],
  ['cabezón', 'M', 'S', 'cabezón'],
  ['cabezón', 'M', 'P', 'cabezones'],
  ['cabezón', 'F', 'S', 'cabezona'],
  ['cabezón', 'F', 'P', 'cabezonas'],
  ['exterior', 'M', 'S', 'exterior'],
  ['exterior', 'F', 'S', 'exterior'],
  ['exterior', 'M', 'P', 'exteriores'],
  ['exterior', 'F', 'P', 'exteriores'],
  ['grande', 'M', 'S', 'grande'],
  ['grande', 'F', 'S', 'grande'],
  ['popular', 'F', 'S', 'popular'],

  ['alamán', 'M', 'S', 'alamán'],
  ['alamán', 'F', 'S', 'alamana'],
  ['alamán', 'M', 'P', 'alamanes'],
  ['alamán', 'F', 'P', 'alamanas'],
  ['caqui', 'F', 'S', 'caqui'],
  ['verde', 'F', 'S', 'verde'],
  ['verde', 'F', 'P', 'verdes'],

  ['adenosín', 'M', 'P', 'adenosines'],
  // ['adenosín', 'F', 'P', 'adenosines'], // can't say what is the valid one
  ['aimará', 'M', 'P', 'aimarás'],
  ['aimará', 'F', 'P', 'aimarás'],
  ['parlanchín', 'F', 'S', 'parlanchina'],

  // invariable
  ['esmeralda', 'M', 'P', 'esmeralda'],
  ['chocolate', 'F', 'S', 'chocolate'],
  ['paja', 'F', 'P', 'paja'],
  ['macho', 'M', 'S', 'macho'],
  // exceptions
  ['joven', 'F', 'S', 'joven'],
  ['joven', 'M', 'P', 'jóvenes'],
  ['virgen', 'M', 'P', 'vírgenes'],
  // nationalities
  ['español', 'M', 'S', 'español'],
  ['español', 'F', 'S', 'española'],
  ['español', 'M', 'P', 'españoles'],
  ['español', 'F', 'P', 'españolas'],
  ['francés', 'M', 'S', 'francés'],
  ['francés', 'F', 'S', 'francesa'],
  ['francés', 'M', 'P', 'franceses'],
  ['francés', 'F', 'P', 'francesas'],
  ['mexicano', 'M', 'S', 'mexicano'],
  ['mexicano', 'M', 'P', 'mexicanos'],
  ['mexicano', 'F', 'S', 'mexicana'],
  ['mexicano', 'F', 'P', 'mexicanas'],
  ['costarricense', 'F', 'S', 'costarricense'],
  ['costarricense', 'M', 'P', 'costarricenses'],
  ['iraquí', 'F', 'S', 'iraquí'],
  ['iraquí', 'M', 'P', 'iraquíes'],
  ['uruguayo', 'F', 'S', 'uruguaya'],
  ['uruguayo', 'M', 'P', 'uruguayos'],
  ['alemán', 'F', 'S', 'alemana'],
  ['japonés', 'F', 'S', 'japonesa'],
  ['danés', 'M', 'P', 'daneses'],
  ['belga', 'F', 'P', 'belgas'],
];

const testCasesBefore = [
  ['bueno', 'F', 'S', 'buena'],
  ['bueno', 'F', 'P', 'buenas'],
  ['bueno', 'M', 'S', 'buen'],
  ['bueno', 'M', 'P', 'buenos'],
  ['alguno', 'M', 'S', 'algún'],

  ['grande', 'M', 'S', 'gran'],
  ['grande', 'F', 'S', 'gran'],
  ['grande', 'F', 'P', 'grandes'],

  ['ciento', 'M', 'S', 'ciento'],
  ['ciento', 'M', 'P', 'cien'],

  ['cualquiera', 'M', 'S', 'cualquier'],
];

describe('spanish-adjectives', function () {
  describe('#agreeSpanishAdjective()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesClassic.length; i++) {
        const testCase = testCasesClassic[i];
        const lemma = testCase[0];
        const gender = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];
        it(`${lemma} ${gender}${number} => ${expected}`, function () {
          assert.strictEqual(SpanishAdjectives.agreeAdjective(lemma, gender, number), expected);
        });
      }
    });

    describe('apocope', function () {
      for (let i = 0; i < testCasesBefore.length; i++) {
        const testCase = testCasesBefore[i];
        const lemma = testCase[0];
        const gender = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];
        it(`${lemma} ${gender}${number} => ${expected}`, function () {
          assert.strictEqual(SpanishAdjectives.agreeAdjective(lemma, gender, number, true), expected);
        });
      }
    });

    describe('edge', function () {
      it(`no adjective`, function () {
        assert.throws(() => SpanishAdjectives.agreeAdjective(null, 'M', 'S'), /adjective/);
      });
      it(`invalid gender`, function () {
        assert.throws(() => SpanishAdjectives.agreeAdjective('esmeralda', 'X', 'S'), /gender/);
      });
      it(`invalid number`, function () {
        assert.throws(() => SpanishAdjectives.agreeAdjective('esmeralda', 'F', 'Z'), /number/);
      });
      it(`invalid adjective`, function () {
        assert.throws(() => SpanishAdjectives.agreeAdjective('esmeralda#', 'F', 'S'), /adjective/);
      });
    });
  });
});
