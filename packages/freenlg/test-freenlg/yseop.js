var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();

const conditions = require("./yseop/conditions");

const allTestSets = { 
  'conditions':conditions
};


/*
let yseopCompiled = freenlgPug.generateYseop(template, {
});

console.log( yseopCompiled.toString() );
*/

module.exports = it => {

  for (var testSetKey in allTestSets) {
    const testSet = allTestSets[testSetKey];

    for (var testKey in testSet) {
      const test = testSet[testKey];

      let yseopCompiled = freenlgPug.generateYseop(test[0], {});

      it(`${testSetKey}: ${testKey}`, () => it.eq( yseopCompiled, test[1]));
  
    }
  }


}
