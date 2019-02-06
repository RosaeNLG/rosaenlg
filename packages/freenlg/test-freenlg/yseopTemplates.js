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

module.exports = it => {

  var ref = removeExtraLineBreaksAndTrim( fs.readFileSync('test-freenlg/yseop/simple.yseop', 'utf-8') );

  let yseopCompiled = removeExtraLineBreaksAndTrim( freenlgPug.compileFile('test-freenlg/yseop/simple.pug', {yseop:true}) );
  
  it(`load file`, () => it.eq( yseopCompiled, ref));
}

