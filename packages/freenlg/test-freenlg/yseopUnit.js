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
  'value',
  'misc',
  'verb'
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

var commandLineTests = process.argv.slice(3);

module.exports = it => {

  for (var i=0; i<allTest.length; i++) {
    var testSetKey = allTest[i];

    if (commandLineTests.length==0 || commandLineTests.indexOf(testSetKey)>-1) {

      const testSet = require(`./yseop/unit/${testSetKey}`);

      for (var testKey in testSet) {
        const test = testSet[testKey];

        it(`${testSetKey}: ${testKey}`, () => it.eq( 
          removeExtraLineBreaksAndTrim( freenlgPug.compile(test[0], {
            yseop:true, 
            language: test.length==3 ? test[2] : 'en_US'
          }) ),
          removeExtraLineBreaksAndTrim(test[1])
        ));
    
      }

    }
  }

}
