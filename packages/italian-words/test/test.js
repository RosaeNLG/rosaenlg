const ItalianWords = require('../dist/index.js');
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

describe('italian-words', function() {
  describe('#getGenderItalianWord()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCasesGender.length; i++) {
        const testCase = testCasesGender[i];
        it(`${testCase[0]}`, function() {
          assert.equal(ItalianWords.getGenderItalianWord(testCase[0]), testCase[1]);
        });
      }
    });

    describe('with specific list', function() {
      it(`use specific list`, function() {
        assert.equal(ItalianWords.getGenderItalianWord('newword', { newword: { G: 'F' } }), 'F');
      });

      it(`use fallback list`, function() {
        assert.equal(ItalianWords.getGenderItalianWord('cameriere', { newword: { G: 'F' } }), 'M');
      });

      it(`overrides`, function() {
        const cameriereInfo = JSON.parse(JSON.stringify(ItalianWords.getWordInfo('cameriere')));
        cameriereInfo['G'] = 'F';
        assert.equal(ItalianWords.getGenderItalianWord('cameriere', { cameriere: cameriereInfo }), 'F');
      });
    });

    describe('edge', function() {
      it(`not found word`, function() {
        assert.throws(() => ItalianWords.getGenderItalianWord('blablax')); // even if it should be here :(
      });
    });
  });

  describe('#getNumberItalianWord()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCasesPlural.length; i++) {
        const testCase = testCasesPlural[i];
        it(`${testCase[0]} ${testCase[1]}`, function() {
          assert.equal(ItalianWords.getNumberItalianWord(testCase[0], testCase[1]), testCase[2]);
        });
      }
    });

    describe('edge', function() {
      it(`invalid number`, function() {
        assert.throws(() => ItalianWords.getNumberItalianWord('cameriere', 'N'), /number/);
      });
      // no plural: spicco - even if it should have it spicchi
      it(`no plural`, function() {
        assert.throws(() => ItalianWords.getNumberItalianWord('spicco', 'P'), /form/);
      });
    });
  });
});
