/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const ItalianAdjectives = require('../dist/index.js');
const ItalianAdjectivesList = require('italian-adjectives-dict');

const testCasesAfter = [
  ['azzurro', 'M', 'S', 'azzurro'],
  ['azzurro', 'M', 'P', 'azzurri'],
  ['azzurro', 'F', 'S', 'azzurra'],
  ['azzurro', 'F', 'P', 'azzurre'],
  ['nero', 'M', 'S', 'nero'],
  ['bianco', 'F', 'S', 'bianca'],
  ['principale', 'M', 'S', 'principale'],
  ['principale', 'F', 'S', 'principale'],
  ['comunale', 'M', 'S', 'comunale'],
  ['comunale', 'F', 'S', 'comunale'],
  ['nero', 'M', 'P', 'neri'],
  ['bugiardo', 'F', 'P', 'bugiarde'],
  ['fedele', 'M', 'P', 'fedeli'],
  ['accogliente', 'M', 'P', 'accoglienti'],
  ['importante', 'F', 'P', 'importanti'],
  // particularités
  ['antico', 'F', 'P', 'antiche'],
  ['lungo', 'F', 'P', 'lunghe'],
  ['antico', 'M', 'P', 'antichi'],
  ['boschereccio', 'F', 'S', 'boschereccia'],
  ['boschereccio', 'F', 'P', 'boscherecce'],
  ['grigio', 'F', 'P', 'grigie'],
  ['egoista', 'M', 'S', 'egoista'],
  ['egoista', 'F', 'S', 'egoista'],
  ['egoista', 'M', 'P', 'egoisti'],
  ['egoista', 'F', 'P', 'egoiste'],
  // invariable
  ['rosa', 'M', 'S', 'rosa'],
  ['rosa', 'M', 'P', 'rosa'],
  ['blu', 'F', 'S', 'blu'],
  ['blu', 'F', 'P', 'blu'],
  // participes
  ['istruito', 'M', 'P', 'istruiti'],
  ['istruito', 'F', 'P', 'istruite'],
  ['educato', 'M', 'S', 'educato'],
  ['educato', 'M', 'P', 'educati'],
  // present participles
  ['esigente', 'F', 'S', 'esigente'],
  ['esigente', 'M', 'P', 'esigenti'],
  // possessives
  ['nostro', 'M', 'S', 'nostro'],
  ['mio', 'M', 'P', 'miei'],
  ['vostro', 'F', 'P', 'vostre'],
  ['tuo', 'F', 'S', 'tua'],
];

const testCasesIrregBefore = [
  // bello M
  ['bello', 'ragazzo', 'M', 'S', 'bel'],
  ['bello', 'tramonti', 'M', 'P', 'bei'],
  ['bello', 'zaino', 'M', 'S', 'bello'],
  ['bello', 'specchi', 'M', 'P', 'begli'],
  ['bello', 'uomo', 'M', 'S', "bell'"],
  ['bello', 'ochi', 'M', 'P', 'begli'],
  // bello F
  ['bello', 'ragazza', 'F', 'S', 'bella'],
  ['bello', 'rose', 'F', 'P', 'belle'],
  ['bello', 'automobile', 'F', 'S', "bell'"],
  ['bello', 'orchidee', 'F', 'P', 'belle'],
  // buono M
  ['buono', 'ragazzo', 'M', 'S', 'buon'],
  ['buono', 'libri', 'M', 'P', 'buoni'],
  ['buono', 'studente', 'M', 'S', 'buono'],
  ['buono', 'zoccoli', 'M', 'P', 'buoni'],
  // buono F
  ['buono', 'fortuna', 'F', 'S', 'buona'],
  ['buono', 'cose', 'F', 'P', 'buone'],
  ['buono', 'amica', 'F', 'S', "buon'"],
  ['buono', 'attrici', 'F', 'P', 'buone'],
  // Un gran signore / un grande signore (a great gentleman), dei grandi film (some great films), un grand'amico / un grande amico (a great friend), una grand'attività / una grande attività (a great activity), dei grandi ospiti (some great guests), delle grandi opere (some great works), un grande spazio (a big space), dei grandi spettacoli (some great shows).
  // grande
  ['grande', 'signore', 'M', 'S', 'gran'],
  ['grande', 'film', 'M', 'P', 'grandi'],
  ['grande', 'amico', 'M', 'S', "grand'"],
  ['grande', 'attività', 'F', 'S', "grand'"],
  ['grande', 'ospiti', 'M', 'P', 'grandi'],
  ['grande', 'opere', 'F', 'P', 'grandi'],
  ['grande', 'spazio', 'M', 'S', 'grande'],
  ['grande', 'spettacoli', 'M', 'P', 'grandi'],
  // santo M
  ['Santo', 'Pietro', 'M', 'S', 'San'],
  ['Santo', 'Pietro e Paolo', 'M', 'P', 'Santi'],
  ['Santo', 'Stefano', 'M', 'S', 'Santo'],
  // santo F
  ['Santo', 'Rita', 'F', 'S', 'Santa'],
  ['Santo', 'Anna', 'F', 'S', "Sant'"],
  ['Santo', 'Anna e Rita', 'F', 'P', 'Sante'],
  // pover'uomo
  ['povero', 'uomo', 'M', 'S', "pover'"],
  ['bravo', 'uomo', 'M', 'S', "brav'"],
];

describe('italian-adjectives', function () {
  describe('#agreeItalianAdjective()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesAfter.length; i++) {
        const testCase = testCasesAfter[i];
        const lemma = testCase[0];
        const gender = testCase[1];
        const number = testCase[2];
        const expected = testCase[3];
        it(`${lemma} ${gender}${number} => ${expected}`, function () {
          assert.strictEqual(
            ItalianAdjectives.agreeItalianAdjective(
              null,
              ItalianAdjectivesList,
              lemma,
              gender,
              number,
              null,
              null,
              null,
            ),
            expected,
          );
        });
      }
    });

    describe('irregular before noun', function () {
      for (let i = 0; i < testCasesIrregBefore.length; i++) {
        const testCase = testCasesIrregBefore[i];
        const lemma = testCase[0];
        const noun = testCase[1];
        const gender = testCase[2];
        const number = testCase[3];
        const expected = testCase[4];
        it(`${lemma} ${gender}${number} ${noun} => ${expected}`, function () {
          assert.strictEqual(
            ItalianAdjectives.agreeItalianAdjective(
              null,
              ItalianAdjectivesList,
              lemma,
              gender,
              number,
              noun,
              true,
              null,
            ),
            expected,
          );
        });
      }
    });

    describe('local adj list', function () {
      const azzurroInfo = JSON.parse(
        JSON.stringify(ItalianAdjectives.getAdjectiveInfo(ItalianAdjectivesList, 'azzurro')),
      );
      const verdeInfo = JSON.parse(JSON.stringify(ItalianAdjectives.getAdjectiveInfo(ItalianAdjectivesList, 'verde')));
      azzurroInfo['MS'] = 'azzurraMS';
      azzurroInfo['FS'] = 'azzurraFS';
      delete azzurroInfo['MP'];

      delete verdeInfo['MS'];

      it(`overrides adj list`, function () {
        assert.strictEqual(
          ItalianAdjectives.agreeItalianAdjective({ azzurro: azzurroInfo }, null, 'azzurro', 'F', 'S', null, null),
          'azzurraFS',
        );
        assert.strictEqual(
          ItalianAdjectives.agreeItalianAdjective({ azzurro: azzurroInfo }, null, 'azzurro', 'M', 'S', null, null),
          'azzurraMS',
        );
        assert.strictEqual(
          ItalianAdjectives.agreeItalianAdjective({ verde: verdeInfo }, null, 'verde', 'M', 'S', null, null),
          'verde',
        );
      });
      it(`classic list still works`, function () {
        assert.strictEqual(
          ItalianAdjectives.agreeItalianAdjective(
            { azzurro: azzurroInfo },
            ItalianAdjectivesList,
            'azzurro',
            'M',
            'P',
            null,
            null,
          ),
          'azzurri',
        );
      });
    });

    describe('getAdjectiveInfo irregular', function () {
      const adjInfo = ItalianAdjectives.getAdjectiveInfo(ItalianAdjectivesList, 'grande');
      it(`grande ok`, function () {
        assert(adjInfo.FP == 'grandi');
      });
    });

    describe('edge', function () {
      it(`regular after noun`, function () {
        assert.strictEqual(
          ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'povero', 'F', 'S', null, true, null),
          'povera',
        );
      });
      it(`adjective not in dict`, function () {
        assert.throws(
          () =>
            ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'blabla', 'F', 'S', null, null, null),
          /list/,
        );
      });
      it(`null dict`, function () {
        assert.throws(
          () => ItalianAdjectives.agreeItalianAdjective(null, null, 'azzurro', 'F', 'S', null, null, null),
          /list/,
        );
      });
      it(`invalid gender`, function () {
        assert.throws(
          () =>
            ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'azzurro', 'X', 'S', null, null, null),
          /gender/,
        );
      });
      it(`invalid number`, function () {
        assert.throws(
          () =>
            ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'azzurro', 'F', 'X', null, null, null),
          /number/,
        );
      });
      it(`must provide the noun`, function () {
        assert.throws(
          () =>
            ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'santo', 'F', 'S', null, true, null),
          /irregular/,
        );
      });
      it(`agreement not found`, function () {
        assert.throws(
          () =>
            ItalianAdjectives.agreeItalianAdjective(null, ItalianAdjectivesList, 'triste', 'F', 'S', null, null, null),
          /but not with FS/,
        );
      });
    });
  });
});
