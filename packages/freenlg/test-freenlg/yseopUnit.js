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
  'verb',
  'comments'
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

        var language = test.length==3 ? test[2] : 'en_US';
        var freenlgtemplate = test[0];

        // check that it is a compliant FreeNLG template
        // it throws an exception when there is an error
        freenlgPug.compile(freenlgtemplate);

        // make the real test
        it(`${testSetKey}: ${testKey}`, () => it.eq( 
          removeExtraLineBreaksAndTrim( freenlgPug.compile(freenlgtemplate, {
            yseop:true,
            language: language
          }) ),
          removeExtraLineBreaksAndTrim(test[1])
        ));
    
      }

    }
  }

}
