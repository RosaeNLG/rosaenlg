var junit = require("junit");
var lib = require('../dist/index.js');

var it = junit();

module.exports = it => {

  it(`hâbleuse aspiré`, () => it.eq( lib.isHAspire('hâbleuse'), true ));
  it(`homme pas aspiré`, () => it.eq( lib.isHAspire('homme'), false ));
  it(`homme muet`, () => it.eq( lib.isHMuet('homme'), true ));
  it(`toto pas aspiré`, () => it.eq( lib.isHAspire('toto'), false ));
  it(`toto pas muet`, () => it.eq( lib.isHMuet('toto'), true ));
}

