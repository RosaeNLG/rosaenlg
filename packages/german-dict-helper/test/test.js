var junit = require("junit");
var GermanDictHelper = require('../dist/index.js').GermanDictHelper;

var it = junit();

const testCasesNouns = [
  ['Augen', 'Auge'],
  ['Knie', 'Knie'],
  ['Flaschen', 'Flasche'],
];

const testCasesAdj = [
  ['gelbe', 'gelb'],
  ['verschwenderischem', 'verschwenderisch'],
]


module.exports = it => {
  const gdh = new GermanDictHelper();

  for (var i=0; i<testCasesNouns.length; i++) {
    const testCase = testCasesNouns[i];
    it(`${testCase[0]} => ${testCase[1]}`, () => it.eq( gdh.getNoun(testCase[0]), testCase[1]));
  }
  
  for (var i=0; i<testCasesAdj.length; i++) {
    const testCase = testCasesAdj[i];
    it(`${testCase[0]} => ${testCase[1]}`, () => it.eq( gdh.getAdj(testCase[0]), testCase[1]));
  }
  
}
