var junit = require("junit");
var FrenchVerbs = require('../dist/index.js');
var it = junit();

const testCasesIntransitif = [
  ["voleter", true],
  ["ambiancer", true],
  ["manger", false],
];

module.exports = it => {
  
  for (var i=0; i<testCasesIntransitif.length; i++) {
    const testCase = testCasesIntransitif[i];
    it(`${testCase[0]}`, () => it.eq( FrenchVerbs.isIntransitive(testCase[0]), testCase[1]));
  }
  
}

