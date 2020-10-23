const assert = require('assert');
const rosaenlgPug = require('../../dist/index.js');

const testCases = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  en_US: ['TextFunction phone_refexpr', '\\phone_chunks', '\\value(phone.screenRatio)'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  fr_FR: ['un super téléphone', '\\setKeyVal("BATTERY", true)'],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  de_DE: ['DEFINITE', '\\phone_chunks'],
};

describe('rosaenlg-yseop', function () {
  describe('tutos', function () {
    Object.keys(testCases).forEach(function (lang) {
      const rendered = rosaenlgPug.renderFile(`../rosaenlg-doc/doc/modules/tutorials/partials/tuto_${lang}.pug`, {
        yseop: true,
        string: true,
      });

      //console.log(rendered);

      const expectedVals = testCases[lang];

      expectedVals.forEach(function (expectedVal) {
        it(`${lang}: ${expectedVal}`, function () {
          assert(rendered.indexOf(expectedVal) > -1);
        });
      });
    });
  });
});
