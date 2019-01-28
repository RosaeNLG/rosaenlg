var junit = require("junit");
var GermanAdjectives = require('../dist/index.js');

var it = junit();

const testCases = [
  [ 'alt', 'NOMINATIVE', 'M', 'S', 'DEFINITE', 'alte'],
  [ 'alt', 'DATIVE', 'N', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE', 'alten'],
];


module.exports = it => {

  for (var i=0; i<testCases.length; i++) {
    const testCase = testCases[i];
    it(`${testCase[0]}`, () => it.eq( 
      GermanAdjectives.agreeGermanAdjective(testCase[0], testCase[1], testCase[2], testCase[3], testCase[4]), 
      testCase[5])
    );
  }

}
