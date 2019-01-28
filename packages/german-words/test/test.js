var junit = require("junit");
var GermanWords = require('../dist/index.js');

var it = junit();

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

module.exports = it => {

  for (var i=0; i<testCasesGender.length; i++) {
    const testCase = testCasesGender[i];
    it(`${testCase[0]}`, () => it.eq( GermanWords.getGenderGermanWord(testCase[0]), testCase[1]));
  }
  for (var i=0; i<testCasesCase.length; i++) {
    const testCase = testCasesCase[i];
    it(`${testCase[0]} ${testCase[1]}`, () => it.eq( GermanWords.getCaseGermanWord(testCase[0], testCase[1]), testCase[2]));
  }
}
