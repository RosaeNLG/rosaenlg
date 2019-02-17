var assert = require('assert');
const freenlgPug = require('../lib/index.js');
var fs = require('fs');

function removeExtraLineBreaksAndTrim(input) {
  var lines = input.replace(/[\r\n|\n|\r]*$/,'')
    .replace(/^[\r\n|\n|\r]*/,'')
    .split('\n');
  for (var i=0; i<lines.length; i++) {
    lines[i] = lines[i].trim();
  }
  return lines.join('\n');
}

var testCases = [
  'simple',
  'include'
]

describe('freenlg-yseop', function() {
  describe('templates', function() {

    for (var i=0; i<testCases.length; i++) {
      var testCase = testCases[i];
  
      // test if it is a valid template
      // PS not clear why language is mandatory just to compile
      freenlgPug.compileFile(`test-yseop/templates/${testCase}.pug`, {language:'en_US'});

      const rendered = removeExtraLineBreaksAndTrim( 
        freenlgPug.renderFile(`test-yseop/templates/${testCase}.pug`, {yseop:true, string:true})
      );
      const expected = removeExtraLineBreaksAndTrim(
        fs.readFileSync(`test-yseop/templates/${testCase}.yseop`, 'utf-8')
      );

      // make the real test
      it(`load file`, function() {
        assert.equal(rendered, expected);
      });
    }
  
  });
});

