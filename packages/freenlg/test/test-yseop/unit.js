var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

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
  'each',
  'mixins',
  'value',
  'misc',
  'verb',
  'comments',
  'adj',
  'possessives',
];

function removeExtraLineBreaksAndTrim(input) {
  var lines = input
    .replace(/[\r\n|\n|\r]*$/, '')
    .replace(/^[\r\n|\n|\r]*/, '')
    .split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].trim();
  }
  return lines.join('\n');
}

var commandLineTests = process.argv.slice(3);

describe('freenlg-yseop', function() {
  describe('unit', function() {
    allTest.forEach(function(testSetKey) {
      const testSet = require(`./unit/${testSetKey}`);

      Object.keys(testSet).forEach(function(testKey) {
        const test = testSet[testKey];

        var language = test.length == 3 ? test[2] : 'en_US';
        var freenlgtemplate = test[0];

        // check that it is a compliant FreeNLG template
        // it throws an exception when there is an error
        freenlgPug.compile(freenlgtemplate);

        const transformed = removeExtraLineBreaksAndTrim(
          freenlgPug.render(freenlgtemplate, {
            yseop: true,
            language: language,
            string: true,
          }),
        );
        const expected = removeExtraLineBreaksAndTrim(test[1]);

        // make the real test
        it(`${testSetKey}: ${testKey}`, function() {
          assert.equal(transformed, expected);
        });
      });
    });
  });
});
