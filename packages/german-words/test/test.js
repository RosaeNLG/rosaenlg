var GermanWords = require('../dist/index.js');
var assert = require('assert');

const testCasesGender = [
  [ 'Genus', 'N'],
  [ 'Korpus', 'N'],
  [ 'Grab', 'N'],
  [ 'Käse', 'M'],
  [ 'Charme', 'M'],
  [ 'Friede', 'M'],
  [ 'Name', 'M'],
  [ 'Gebühr', 'F'],
  [ 'Gestalt', 'F'],
];

const testCasesCase = [
  ['Mann', 'GENITIVE', 'Manns'],
  ['Kind', 'GENITIVE', 'Kinds'],
  ['Kind', 'DATIVE', 'Kinde'],
  ['Frau', 'ACCUSATIVE', 'Frau'],
  ['Mann', 'ACCUSATIVE', 'Mann'],
];

describe('german-words', function() {
  describe('#getGenderGermanWord()', function() {

    for (var i=0; i<testCasesGender.length; i++) {
      const testCase = testCasesGender[i];
      it(`${testCase[0]}`, function() {
        assert.equal( GermanWords.getGenderGermanWord(testCase[0]), testCase[1] )
      });
    }

  });

  describe('#getCaseGermanWord()', function() {

    for (var i=0; i<testCasesCase.length; i++) {
      const testCase = testCasesCase[i];
      it(`${testCase[0]} ${testCase[1]}`, function() {
        assert.equal( GermanWords.getCaseGermanWord(testCase[0], testCase[1]), testCase[2] )
      });
    }

  });
});

