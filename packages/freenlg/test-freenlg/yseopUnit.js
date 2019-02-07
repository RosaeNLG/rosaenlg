var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var it = junit();

const allTest = [
  'text',
  'code',
  'conditions',
  'enums',
  'switch',
  'synonyms',
  'hassaid',
  'val',
  'foreach',
  'mixins'
];

function removeExtraLineBreaks(input) {
  return input.replace(/[\r\n|\n|\r]*$/,'').replace(/^[\r\n|\n|\r]*/,'');
}

module.exports = it => {

  for (var i=0; i<allTest.length; i++) {
    var testSetKey = allTest[i];
    const testSet = require(`./yseop/unit/${testSetKey}`);

    for (var testKey in testSet) {
      const test = testSet[testKey];

      let yseopCompiled = freenlgPug.compile(test[0], {yseop:true});

      yseopCompiled = removeExtraLineBreaks(yseopCompiled);
      test[1] = removeExtraLineBreaks(test[1]);

      it(`${testSetKey}: ${testKey}`, () => it.eq( yseopCompiled, test[1]));
  
    }
  }

}

