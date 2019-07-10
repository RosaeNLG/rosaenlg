var assert = require('assert');
const freenlgPug = require('../../dist/index.js');

const testCases = {
  // eslint-disable-next-line @typescript-eslint/camelcase
  en_US: ['TextFunction phone_refexpr', '\\phone_chunks', '\\value(phone.screenRatio)'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  fr_FR: ['un super téléphone', '\\setKeyVal("BATTERY", true)'],
  // eslint-disable-next-line @typescript-eslint/camelcase
  de_DE: ['DEFINITE', '\\phone_chunks'],
};

describe('freenlg-yseop', function() {
  describe('tutos', function() {
    Object.keys(testCases).forEach(function(lang) {
      const rendered = freenlgPug.renderFile(`doc/modules/tutorials/partials/tuto_${lang}.pug`, {
        yseop: true,
        string: true,
      });

      //console.log(rendered);

      const expectedVals = testCases[lang];

      expectedVals.forEach(function(expectedVal) {
        it(`${lang}: ${expectedVal}`, function() {
          assert(rendered.indexOf(expectedVal) > -1);
        });
      });
    });
  });
});
