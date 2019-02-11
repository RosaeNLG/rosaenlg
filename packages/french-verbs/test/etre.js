var junit = require("junit");
var FrenchVerbs = require('../dist/index.js');
var it = junit();


const testCasesEtre = [
  ["retomber", true],
  ["naitre", true],
  ["manger", false],
];

module.exports = it => {

  for (var i=0; i<testCasesEtre.length; i++) {
    const testCase = testCasesEtre[i];
    it(`${testCase[0]}`, () => it.eq( FrenchVerbs.alwaysAuxEtre(testCase[0]), testCase[1]));
  }
  

}

