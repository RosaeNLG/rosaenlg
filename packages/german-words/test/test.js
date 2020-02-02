const GermanWords = require('../dist/index.js');
const GermanWordsList = require('german-words-dict');
const assert = require('assert');

const testCasesGender = [
  ['Genus', 'N'],
  ['Korpus', 'N'],
  ['Grab', 'N'],
  ['Käse', 'M'],
  ['Charme', 'M'],
  ['Friede', 'M'],
  ['Name', 'M'],
  ['Gebühr', 'F'],
  ['Gestalt', 'F'],
];

const testCasesCase = [
  ['Mann', 'GENITIVE', 'S', 'Manns'],
  ['Kind', 'GENITIVE', 'S', 'Kinds'],
  ['Kind', 'DATIVE', 'S', 'Kinde'],
  ['Frau', 'ACCUSATIVE', 'S', 'Frau'],
  ['Mann', 'ACCUSATIVE', 'S', 'Mann'],
  ['Gurke', 'NOMINATIVE', 'P', 'Gurken'],
  ['Bäckerei', 'NOMINATIVE', 'P', 'Bäckereien'],
  ['Rhythmus', 'NOMINATIVE', 'P', 'Rhythmen'],
];

describe('german-words', function() {
  this.timeout(5000);
  describe('#getGenderGermanWord()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCasesGender.length; i++) {
        const testCase = testCasesGender[i];
        it(`${testCase[0]}`, function() {
          assert.equal(GermanWords.getGenderGermanWord(GermanWordsList, testCase[0]), testCase[1]);
        });
      }
    });

    describe('with specific list', function() {
      it(`use specific list`, function() {
        assert.equal(GermanWords.getGenderGermanWord({ Newword: { G: 'N' } }, 'Newword'), 'N');
      });

      it(`overrides`, function() {
        const mannInfo = JSON.parse(JSON.stringify(GermanWords.getWordInfo(GermanWordsList, 'Mann')));
        //console.log(mannInfo);
        mannInfo['G'] = 'F';
        assert.equal(GermanWords.getGenderGermanWord({ Mann: mannInfo }, 'Mann'), 'F');
      });
    });

    describe('edge', function() {
      it(`not found word`, function() {
        assert.throws(() => GermanWords.getGenderGermanWord(GermanWordsList, 'Blabla'));
      });
    });
  });

  describe('#getCaseGermanWord()', function() {
    describe('nominal', function() {
      for (let i = 0; i < testCasesCase.length; i++) {
        const testCase = testCasesCase[i];
        it(`${testCase[0]} ${testCase[1]}`, function() {
          assert.equal(
            GermanWords.getCaseGermanWord(GermanWordsList, testCase[0], testCase[1], testCase[2]),
            testCase[3],
          );
        });
      }
    });

    describe('edge', function() {
      it(`not dict`, function() {
        assert.throws(() => GermanWords.getCaseGermanWord(null, 'Mann', 'DATIVE', 'S'), /list/);
      });
      it(`not found word`, function() {
        assert.throws(() => GermanWords.getCaseGermanWord(GermanWordsList, 'Blabla', 'DATIVE', 'S'), /dict/);
      });
      it(`invalid case`, function() {
        assert.throws(() => GermanWords.getCaseGermanWord(GermanWordsList, 'Mann', 'GERMINATIVE', 'S'), /case/);
      });
      it(`invalid number`, function() {
        assert.throws(() => GermanWords.getCaseGermanWord(GermanWordsList, 'Mann', 'DATIVE', 'Toto'), /number/);
      });
    });
  });
});
