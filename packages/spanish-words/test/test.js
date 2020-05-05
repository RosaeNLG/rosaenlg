const SpanishWords = require('../dist/index.js');
const assert = require('assert');

const testCasesGender = [
  ['libro', 'M'],
  ['radio', 'F'],
  ['decente', 'N'],
];

const testCasesPlural = [
  ['película', 'películas'],
  ['jueves', 'jueves'],
];

describe('spanish-words', function () {
  describe('#getGenderSpanishWord()', function () {
    describe('no list', function () {
      for (let i = 0; i < testCasesGender.length; i++) {
        const testCase = testCasesGender[i];
        it(`${testCase[0]}`, function () {
          assert.equal(SpanishWords.getGenderSpanishWord(null, testCase[0]), testCase[1]);
        });
      }
    });
    describe('with list', function () {
      const list = {
        casa: {
          gender: 'M', // to be sure it checks in local list
        },
      };
      it(`casa should be M now`, function () {
        assert.equal(SpanishWords.getGenderSpanishWord(list, 'casa'), 'M');
      });
      it(`hombre not found`, function () {
        assert.throws(() => SpanishWords.getGenderSpanishWord(list, 'hombre'), /gender/);
      });
    });
  });

  describe('#getPluralSpanishWord()', function () {
    describe('no list', function () {
      for (let i = 0; i < testCasesPlural.length; i++) {
        const testCase = testCasesPlural[i];
        it(`${testCase[0]} ${testCase[1]}`, function () {
          assert.equal(SpanishWords.getPluralSpanishWord(null, testCase[0]), testCase[1]);
        });
      }
    });
    describe('with list', function () {
      const list = {
        casa: {
          plural: 'casax', // to be sure it checks in local list
        },
      };
      it(`casa plural should be casax now`, function () {
        assert.equal(SpanishWords.getPluralSpanishWord(list, 'casa'), 'casax');
      });
      it(`hombre not found`, function () {
        assert.throws(() => SpanishWords.getPluralSpanishWord(list, 'hombre'), /plural/);
      });
    });
  });

  describe('#getWordInfo()', function () {
    it(`should work`, function () {
      const alianza = SpanishWords.getWordInfo('alianza');
      assert.equal(alianza.gender, 'F');
      assert.equal(alianza.plural, 'alianzas');
    });
  });
});
