var assert = require('assert');
const freenlgPug = require('../../dist/index.js');
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

    testCases.forEach(function(testCase) {
  
      // test if it is a valid template
      // PS not clear why language is mandatory just to compile
      freenlgPug.compileFile(`${__dirname}/templates/${testCase}.pug`, {language:'en_US'});

      const rendered = removeExtraLineBreaksAndTrim( 
        freenlgPug.renderFile(`${__dirname}/templates/${testCase}.pug`, {yseop:true, string:true})
      );
      const expected = removeExtraLineBreaksAndTrim(
        fs.readFileSync(`${__dirname}/templates/${testCase}.yseop`, 'utf-8')
      );

      // make the real test
      it(`load file ${testCase}`, function() {
        assert.equal(rendered, expected);
      });

    });   
  
  });
});

