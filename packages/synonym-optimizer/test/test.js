/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('assert');
const SynOptimizer = require('../dist/index.js').SynOptimizer;
const buildLanguageSyn = require('../dist/helper.js').buildLanguageSyn;

const extractedWordsPerLang = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fr: {
    "Bonjour. Je suis très content, j'ai mangé une bonne salade!!!": [
      'Bonjour',
      'Je',
      'suis',
      'très',
      'content',
      'ai',
      'mangé',
      'une',
      'bonne',
      'salade',
    ],
    'bla.bla': ['bla', 'bla'],
    '... et : alors!': ['et', 'alors'],
    '<div>bla <b>bla</b><div>': ['bla', 'bla'],
    '<p><toto>bla</toto></p>': ['toto', 'bla', 'toto'],
    "j'ai mangé je n'ai pas t'as vu": ['ai', 'mangé', 'je', 'ai', 'pas', 'as', 'vu'],
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  es: {
    'Hago una prueba': ['Hago', 'una', 'prueba'],
  },
};

const stemmedFiltered = [
  ['fr', 'absolument constitutionnel bouffé', ['constitutionnel', 'bouff']],
  ['es', 'absolutamente constitucional aguas', ['absolut', 'constitucional', 'agu']],
];

const wordsWithPos = [
  [
    'fr',
    ['bla', 'alors', 'bla', 'bli', 'xxx', 'xxx', 'yyy'],
    null,
    { bla: [0, 2], alors: [1], bli: [3], xxx: [4, 5], yyy: [6] },
  ],
  ['fr', ['bla', 'bla', 'je', 'ai', 'bla'], null, { bla: [0, 1, 4], je: [2], ai: [3] }],
  ['en', ['bla', 'bli', 'blu'], null, { bla: [0], bli: [1], blu: [2] }],
  ['en', ['bla', 'bli', 'blu'], [['bla', 'blu']], { bla_blu: [0, 2], bli: [1] }], // eslint-disable-line
  ['it', ['azzurra', 'cameriere'], null, { azzurra: [0], cameriere: [1] }],
  ['nl', ['slipje', 'bokser', 'snaar'], null, { slipje: [0], bokser: [1], snaar: [2] }],
  ['nl', ['slipje', 'bokser', 'snaar'], [['slipje', 'bokser']], { slipje_bokser: [0, 1], snaar: [2] }], // eslint-disable-line
];

const scores = [
  [{ bla: [0, 1, 4], je: [2], ai: [3, 5, 6] }, 2.83],
  [{ bla: [0], bli: [1], blu: [2] }, 0],
];

const globalTests = [
  ['fr', ['bla bla bla', 'bli bla bla'], 1],
  ['fr', ['bla bli bla', 'bla bla bli'], 0],
];

const scoreAlternativeTests = [
  ['en', 'arms arm', 1],
  ['en', 'diamonds diamond', 1],
  ['en', 'he eats they eat', 1],
  ['en', 'I engineered I engineer', 1],
  ['fr', 'bonjour test', 0],
  ['fr', 'poubelle alors alors alors poubelles', 1],
  ['fr', 'allée allé', 1],
  ['de', 'katholik katholische katholischen', 2],
  ['it', 'azzurra cameriere', 0],
  ['it', 'azzurra azzurra', 1],
  ['it', 'azzurra azzurro azzurri', 2],
  ['it', 'azzurra azzurro azzurri azzurre cameriere', 3],
  ['it', 'camerieri cameriera', 1],
  ['it', 'azzurra azzurro azzurri azzurre camerieri cameriera', 4],
  ['es', 'agua agua', 1],
  ['es', 'agua aguas', 1],
  ['nl', 'slipje bokser snaar', 0],
  ['nl', 'slipje slipje slipje', 2],
  ['nl', 'slipje slipje slips', 1],
  ['ja', '本当に暑いです', 0], // doesn't work at all, but should not fail
];

const stdStopWords = {
  fr: ['de'],
  en: ['the'],
  de: ['ich'],
  it: ['uno'],
  es: ['un'],
};

describe('synonym-optimizer', function () {
  describe('#getStandardStopWords', function () {
    it('alors / fr', function () {
      assert(buildLanguageSyn('fr').getStandardStopWords().includes('alors'));
    });
    it('entonces / es', function () {
      assert(buildLanguageSyn('es').getStandardStopWords().includes('entonces'));
    });
    it('void if new language', function () {
      assert(buildLanguageSyn('nl').getStandardStopWords().length === 0);
    });
    Object.keys(stdStopWords).forEach(function (lang) {
      const languageSyn = buildLanguageSyn(lang);
      const stopWordsList = languageSyn.getStandardStopWords();
      it(`${lang} stop words : ${stdStopWords[lang].join()}`, function () {
        for (let i = 0; i < stdStopWords[lang].length; i++) {
          const stopWord = stdStopWords[lang][i];
          assert(stopWordsList.indexOf(stopWord) > -1);
        }
      });
    });
  });

  describe('#getStopWords', function () {
    it('specific list', function () {
      const synOptimizer = new SynOptimizer('something');
      assert.deepStrictEqual(synOptimizer.getStopWords(null, null, ['xx', 'yy']), ['xx', 'yy']);
    });
    it('remove', function () {
      const synOptimizer = new SynOptimizer('fr');
      assert(!synOptimizer.getStopWords(null, 'alors', null).includes('alors'));
    });
    it('add', function () {
      const synOptimizer = new SynOptimizer('fr');
      assert(synOptimizer.getStopWords(['blabla'], null, null).includes('blabla'));
    });
    it('new language', function () {
      const synOptimizer = new SynOptimizer('nl');
      assert(synOptimizer.getStopWords(null, null, null).length === 0);
      assert(synOptimizer.getStopWords(['de', 'een'], null, null).includes('een'));
    });
  });

  //  const stemmedFiltered = [['fr_FR', 'absolument constitutionnel bouffé', ['absolument', 'constitutionnel', 'bouff']]];
  // getStemmedWords(text: string, stopwords: string[], lang: Languages): string[] {
  describe('#getStemmedWords', function () {
    for (let i = 0; i < stemmedFiltered.length; i++) {
      const testCase = stemmedFiltered[i];
      const lang = testCase[0];
      const synOptimizer = new SynOptimizer(lang);
      const input = testCase[1];
      const expected = testCase[2];
      it(`${lang} ${input} => ${expected}`, function () {
        assert.deepStrictEqual(
          synOptimizer.getStemmedWords(input, synOptimizer.getStopWords(null, null, null)),
          expected,
        );
      });
    }
  });

  describe('#extractWords', function () {
    for (const lang in extractedWordsPerLang) {
      describe(lang, function () {
        const cases = extractedWordsPerLang[lang];
        const languageSyn = buildLanguageSyn(lang);
        Object.keys(cases).forEach(function (key) {
          const vals = cases[key];
          it(`${key} => ${JSON.stringify(vals)}`, function () {
            assert.deepStrictEqual(languageSyn.extractWords(key), vals);
          });
        });
      });
    }
  });

  describe('#getWordsWithPos', function () {
    describe('nominal', function () {
      wordsWithPos.forEach(function (testCase) {
        const lang = testCase[0];
        const input = testCase[1];
        const identicals = testCase[2];
        const expected = testCase[3];
        const synOptimizer = new SynOptimizer(lang);
        it(`${input}`, function () {
          assert.deepStrictEqual(synOptimizer.getWordsWithPos(input, identicals), expected);
        });
      });
    });

    describe('edge', function () {
      const synOptimizer = new SynOptimizer('us');
      it(`identicals not string[]`, function () {
        assert.throws(() => synOptimizer.getWordsWithPos(['bla'], 'bla'), /string/);
      });
      it(`identicals not string[][]`, function () {
        assert.throws(() => synOptimizer.getWordsWithPos(['bla'], ['bla']), /string/);
      });
    });
  });

  describe('#getScore', function () {
    const synOptimizer = new SynOptimizer('somelanguage');
    scores.forEach(function (testCase) {
      const input = testCase[0];
      const expected = testCase[1];
      it(`${JSON.stringify(input)} => ~${expected}`, function () {
        assert(Math.abs(synOptimizer.getScore(input) - expected) < 0.01);
      });
    });
  });

  describe('#getBest', function () {
    globalTests.forEach(function (testCase) {
      const lang = testCase[0];
      const synOptimizer = new SynOptimizer(lang);
      const input = testCase[1];
      const expected = testCase[2];
      it(`some test in ${lang} => ${expected}`, function () {
        assert.strictEqual(synOptimizer.getBest(input, null, null, null, null, null), expected);
      });
    });
  });

  describe('#scoreAlternative', function () {
    it(`nominal`, function () {
      scoreAlternativeTests.forEach(function (testCase) {
        const lang = testCase[0];
        const synOptimizer = new SynOptimizer(lang);
        const input = testCase[1];
        const expectedScore = testCase[2];
        it(`${lang} ${input} => ${expectedScore}`, function () {
          const debugHolder = {};
          const score = synOptimizer.scoreAlternative(input, null, null, null, null, debugHolder);
          //console.log(debugHolder);
          assert.strictEqual(score, expectedScore);
        });
      });
    });

    it(`with debug`, function () {
      const debug = {};
      const synOptimizer = new SynOptimizer('fr');
      synOptimizer.scoreAlternative('AAA AAA', null, null, null, null, debug);
      assert.strictEqual(debug.score, 1);
    });

    const forIdenticalsTest = 'phone cellphone smartphone bla bla';
    it(`identicals - without`, function () {
      const synOptimizer = new SynOptimizer('fr');
      assert.strictEqual(synOptimizer.scoreAlternative(forIdenticalsTest, null, null, null, null, null), 1);
    });

    it(`identicals - with`, function () {
      const debugHolder = {};
      const synOptimizer = new SynOptimizer('fr');
      const score = synOptimizer.scoreAlternative(
        forIdenticalsTest,
        null,
        null,
        null,
        [['phone', 'cellphone', 'smartphone']],
        debugHolder,
      );
      //console.log(debugHolder);
      assert.strictEqual(score, 3);
    });

    /*
    it(`invalid language`, function() {
      assert.throws(() => lib.scoreAlternative('latin', 'bla', null, null, null, null, null), /language/);
    });
    */
  });
});
