var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();


const template = `
p
  - var toto = 'xxx';
  if test==true
    | bla.bla

  if test2==true
    | bla
  else
    | bli
`;

let yseopCompiled = freenlgPug.compile(template, {
  //language: 'en_US',
  yseop: true
});

console.log( yseopCompiled.toString() );

/*
module.exports = it => {


  it('test without filter', () => it.eq( rendered, 
      '<p><a href="https://www.google.com/">Google</a>bla.bla</p>'
    ));

}
*/
