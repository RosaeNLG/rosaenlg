var junit = require("junit");
const freenlgPug = require('../lib/index.js');
var it = junit();

const testCases = {
  'en_US': ['TextFunction phone_refexpr', '\\phone_chunks', '\\value(phone.screenRatio)'],
  'fr_FR': ['un super téléphone', '\\action(TCEC.setKeyVal("BATTERY", true))'],
  'de_DE': ['DEFINITE', '\\phone_chunks']
};

module.exports = it => {

  for (var lang in testCases) {

    var yseopTemplate = freenlgPug.compileFile(`../freenlg-core/doc/tuto_${lang}.pug`, {yseop:true});

    // console.log(yseopTemplate);

    var expectedVals = testCases[lang];
    for (var i=0; i<expectedVals.length; i++) {
      var expectedVal  = expectedVals[i];

      it(`${lang}: ${expectedVal}`, () => it.eq( yseopTemplate.indexOf(expectedVal)>-1, true ));
    }
  }
}

