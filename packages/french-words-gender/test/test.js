var junit = require("junit");
var FrenchWords = require('../dist/index.js');

var it = junit();

const testCases = [
  [ 'homme', 'M'],
  [ 'femme', 'F'],
  [ 'blabla', 'M'],
  [ 'blablabla', 'M'],
  [ 'métro', 'M'],
  [ 'rame', 'F'],
  [ 'aller-retour', 'M'],
  [ 'autoroute', 'F'],
  [ 'bouffe', 'F'],
];


module.exports = it => {

  for (var i=0; i<testCases.length; i++) {
    const testCase = testCases[i];
    it(`${testCase[0]}`, () => it.eq( FrenchWords.getGenderFrenchWord(testCase[0]), testCase[1]));
  }
    
}
