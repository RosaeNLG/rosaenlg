const pug = require('pug');
const NlgLib = require('./index').NlgLib;

var pugLib = require('pug/lib');


// https://www.tutorialkart.com/nodejs/override-function-of-a-node-js-module/
/*
var oldCompile = pugLib.compile;
delete pugLib['compile'];

pugLib.compile = function(str, options){


  console.log("AAAAAAA");

  return oldCompile(str, options);
};

module.exports = pugLib;
*/
//console.log(oldCompile.toString());


let nlgLib = new NlgLib({language: 'en_US'});

var compiled = pug.compileFile('atest.pug');

console.log(compiled.toString());

var rendered = compiled({
  util: nlgLib,
  data: null
});


console.log(rendered);

