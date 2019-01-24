var junit = require("junit");
var lib = require('../dist/index.js');

var it = junit();

const testCases = [
  [2, 'deuxième'],
  [67, 'soixante-septième'],
]

module.exports = it => {
  for (var i=0; i<testCases.length; i++) {
    const testCase = testCases[i];
    it(`${testCase[1]}`  , () => it.eq( lib.getOrdinal(testCase[0]), testCase[1]));
  }
}
