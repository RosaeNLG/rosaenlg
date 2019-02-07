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
  'mixins',
  'value'
];

function removeExtraLineBreaksAndTrim(input) {
  var lines = input.replace(/[\r\n|\n|\r]*$/,'')
    .replace(/^[\r\n|\n|\r]*/,'')
    .split('\n');
  for (var i=0; i<lines.length; i++) {
    lines[i] = lines[i].trim();
  }
  return lines.join('\n');
}

module.exports = it => {

  for (var i=0; i<allTest.length; i++) {
    var testSetKey = allTest[i];
    const testSet = require(`./yseop/unit/${testSetKey}`);

    for (var testKey in testSet) {
      const test = testSet[testKey];

      it(`${testSetKey}: ${testKey}`, () => it.eq( 
        removeExtraLineBreaksAndTrim( freenlgPug.compile(test[0], {yseop:true}) ),
        removeExtraLineBreaksAndTrim(test[1])
      ));
  
    }
  }

}

