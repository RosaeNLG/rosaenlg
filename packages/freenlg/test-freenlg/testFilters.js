var junit = require("junit");
const filterLib = require("freenlg-core").filterLib;

var it = junit();


module.exports = it => {
  
  for (var langKey in filterLib.testCasesByLang) {

    var testCases = filterLib.testCasesByLang[langKey];

    for (let testCase of testCases) {

      var params = {language: langKey};
  
      var orig = testCase[0];
      var expected = testCase[1];
      var filtered = filterLib.filter(orig, params);
      
      it(testCase, () => it.eq(filtered, expected));
    } 
  
  }

};

