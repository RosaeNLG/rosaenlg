var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCases = {
  en_US: ['TextFunction phone_refexpr', '\\phone_chunks', '\\value(phone.screenRatio)'],
  fr_FR: ['un super téléphone', '\\action(TCEC.setKeyVal("BATTERY", true))'],
  de_DE: ['DEFINITE', '\\phone_chunks'],
};

describe('freenlg-yseop', function() {
  describe('tutos', function() {
    Object.keys(testCases).forEach(function(lang) {
      const rendered = freenlgPug.renderFile(`doc/tuto_${lang}.pug`, { yseop: true, string: true });
      const expectedVals = testCases[lang];

      expectedVals.forEach(function(expectedVal) {
        it(`${lang}: ${expectedVal}`, function() {
          assert(rendered.indexOf(expectedVal) > -1);
        });
      });
    });
  });
});
