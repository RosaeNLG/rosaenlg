var junit = require("junit");
var LefffHelper = require('../dist/index.js').LefffHelper;

var it = junit();

const testCasesNouns = [
  ['yeux', 'oeil'],
  ['genoux', 'genou'],
  ['bouteille', 'bouteille'],
];

const testCasesAdj = [
  ['jaunes', 'jaune'],
  ['somptueuse', 'somptueux'],
]


module.exports = it => {
  const lh = new LefffHelper();

  for (var i=0; i<testCasesNouns.length; i++) {
    const testCase = testCasesNouns[i];
    it(`${testCase[0]} => ${testCase[1]}`, () => it.eq( lh.getNoun(testCase[0]), testCase[1]));
  }
  
  for (var i=0; i<testCasesAdj.length; i++) {
    const testCase = testCasesAdj[i];
    it(`${testCase[0]} => ${testCase[1]}`, () => it.eq( lh.getAdj(testCase[0]), testCase[1]));
  }
  
}
