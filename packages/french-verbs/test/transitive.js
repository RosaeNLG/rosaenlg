var junit = require("junit");
var FrenchVerbs = require('../dist/index.js');
var it = junit();


const testCasesTransitif = [
  ["accuser", true],
  ["zondomiser", true],
  ["zoner", true],
  ["oindre", true],
  ["orner", true],
  ["obéir", true],
  ["monter", true],
  ["voltiger", false],
  ["batifoler", false],
];

module.exports = it => {
  
  for (var i=0; i<testCasesTransitif.length; i++) {
    const testCase = testCasesTransitif[i];
    it(`${testCase[0]}`, () => it.eq( FrenchVerbs.isTransitive(testCase[0]), testCase[1]));
  }

}

