const ItalianWords = require('../dist/index.js');
const ItalianWordsList = require('italian-words-dict');
const assert = require('assert');

const testCasesGender = [
  ['cameriere', 'M'],
  ['cameriera', 'F'],
  ['libro', 'M'],
  ['sedia', 'F'],
  ['fiore', 'M'],
  ['televisione', 'F'],
  ['attrice', 'F'],
  ['imperatore', 'M'],
  ['imperatrice', 'F'],
  ['avvocato', 'M'],
  ['avvocatessa', 'F'],
];

const testCasesPlural = [
  ['libro', 'P', 'libri'],
  ['sedia', 'P', 'sedie'],
  ['fiore', 'P', 'fiori'],
  ['televisione', 'P', 'televisioni'],
  ['uomo', 'P', 'uomini'],
  ['re', 'P', 're'],
  ['ossigeno', 'P', 'ossigeni'],
  ['caffè', 'P', 'caffè'],
  ['yogurt', 'P', 'yogurt'],
  ['città', 'P', 'città'],
  ['università', 'P', 'università'],
  ['occhiale', 'P', 'occhiali'], // even if only used in the plural form
  ['poeta', 'P', 'poeti'],
  ['problema', 'P', 'problemi'],
  ['mano', 'P', 'mani'],
  ['braccio', 'P', 'braccia'],
  ['ginocchio', 'P', 'ginocchia'],
  ['uovo', 'P', 'uova'],
  ['lago', 'P', 'laghi'],
  ['amica', 'P', 'amiche'],
  ['amico', 'P', 'amici'],
  ['medico', 'P', 'medici'],
  ['arancia', 'P', 'arance'],
  ['senatùr', 'P', 'senatùr'],
  ['spicco', 'S', 'spicco'],
];

describe('italian-words', function () {
  describe('#getGenderItalianWord()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesGender.length; i++) {
        const testCase = testCasesGender[i];
        it(`${testCase[0]}`, function () {
          assert.equal(ItalianWords.getGenderItalianWord(ItalianWordsList, testCase[0]), testCase[1]);
        });
      }
    });

    describe('with specific list', function () {
      it(`use specific list`, function () {
        assert.equal(ItalianWords.getGenderItalianWord({ newword: { G: 'F' } }, 'newword'), 'F');
      });

      it(`overrides`, function () {
        const cameriereInfo = JSON.parse(JSON.stringify(ItalianWords.getWordInfo(ItalianWordsList, 'cameriere')));
        cameriereInfo['G'] = 'F';
        assert.equal(ItalianWords.getGenderItalianWord({ cameriere: cameriereInfo }, 'cameriere'), 'F');
      });
    });

    describe('edge', function () {
      it(`not found word`, function () {
        assert.throws(() => ItalianWords.getGenderItalianWord(ItalianWordsList, 'blablax')); // even if it should be here :(
      });
    });
  });

  describe('#getNumberItalianWord()', function () {
    describe('nominal', function () {
      for (let i = 0; i < testCasesPlural.length; i++) {
        const testCase = testCasesPlural[i];
        it(`${testCase[0]} ${testCase[1]}`, function () {
          assert.equal(ItalianWords.getNumberItalianWord(ItalianWordsList, testCase[0], testCase[1]), testCase[2]);
        });
      }
    });

    describe('edge', function () {
      it(`null list`, function () {
        assert.throws(() => ItalianWords.getNumberItalianWord(null, 'cameriere', 'S'), /list/);
      });
      it(`word not found`, function () {
        assert.throws(() => ItalianWords.getNumberItalianWord(ItalianWordsList, 'zzzzz', 'S'), /not found/);
      });
      it(`invalid number`, function () {
        assert.throws(() => ItalianWords.getNumberItalianWord(ItalianWordsList, 'cameriere', 'N'), /number/);
      });
      // no plural: spicco - even if it should have it spicchi
      it(`no plural`, function () {
        assert.throws(() => ItalianWords.getNumberItalianWord(ItalianWordsList, 'spicco', 'P'), /form/);
      });
    });
  });
});
