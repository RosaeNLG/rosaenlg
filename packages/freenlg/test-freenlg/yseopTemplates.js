var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var fs = require('fs');
var it = junit();

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

module.exports = it => {
  for (var i=0; i<testCases.length; i++) {
    var testCase = testCases[i];

    // test if it is a valid template
    // PS not clear why language is mandatory just to compile
    freenlgPug.compileFile(`test-freenlg/yseop/templates/${testCase}.pug`, {language:'en_US'});

    // make the real test
    it(`load file`, () => it.eq(
      removeExtraLineBreaksAndTrim( 
        freenlgPug.compileFile(`test-freenlg/yseop/templates/${testCase}.pug`, {yseop:true})
      ),
      removeExtraLineBreaksAndTrim(
        fs.readFileSync(`test-freenlg/yseop/templates/${testCase}.yseop`, 'utf-8')
      )
    ));
  }
}

