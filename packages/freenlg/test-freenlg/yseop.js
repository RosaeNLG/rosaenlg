var junit = require("junit");
const freenlgPug = require('../lib/index.js');

var it = junit();

//const conditions = require("./yseop/conditions");

const allTestSets = { 
  'text':require("./yseop/text"),
  'conditions':require("./yseop/conditions"),
  'enums':require("./yseop/enums"),
  'switch':require("./yseop/switch"),
  'synonyms':require("./yseop/synonyms"),
  'hassaid':require("./yseop/hassaid"),
  'val':require("./yseop/val"),
  //'foreach':require("./yseop/foreach"),
};


function removeExtraLineBreaks(input) {
  return input.replace(/[\r\n|\n|\r]*$/,'').replace(/^[\r\n|\n|\r]*/,'');
}

module.exports = it => {

  for (var testSetKey in allTestSets) {
    const testSet = allTestSets[testSetKey];

    for (var testKey in testSet) {
      const test = testSet[testKey];

      let yseopCompiled = freenlgPug.generateYseop(test[0], {});

      yseopCompiled = removeExtraLineBreaks(yseopCompiled);
      test[1] = removeExtraLineBreaks(test[1]);

      it(`${testSetKey}: ${testKey}`, () => it.eq( yseopCompiled, test[1]));
  
    }
  }


}
