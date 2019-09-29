const assert = require('assert');
const GermanDictHelper = require('../dist/index.js').GermanDictHelper;

const testCasesNouns = [
  ['Augen', 'Auge'],
  ['Knie', 'Knie'],
  ['Flaschen', 'Flasche'],
  // edge cases
  ['Blablabla', null],
];

const testCasesAdj = [
  ['gelbe', 'gelb'],
  ['verschwenderischem', 'verschwenderisch'],
  // adjectif verbal
  ['überraschende', 'überraschend'],
  ['überraschendes', 'überraschend'],
  ['zitternder', 'zitternd'],
  ['zitternde', 'zitternd'],
  // past participle
  ['enttäuschte', 'enttäuscht'],
  // edge cases
  ['blablabla', null],
];

const gdh = new GermanDictHelper();

describe('german-dict-helper', function() {
  describe('#getNoun()', function() {
    for (let i = 0; i < testCasesNouns.length; i++) {
      const testCase = testCasesNouns[i];
      it(`${testCase[0]} => ${testCase[1]}`, function() {
        assert.equal(gdh.getNoun(testCase[0]), testCase[1]);
      });
    }
  });
  describe('#isNoun()', function() {
    it(`Grün`, function() {
      assert(gdh.isNoun('Grün'));
    });
  });

  describe('#getAdj()', function() {
    for (let i = 0; i < testCasesAdj.length; i++) {
      const testCase = testCasesAdj[i];
      it(`${testCase[0]} => ${testCase[1]}`, function() {
        assert.equal(gdh.getAdj(testCase[0]), testCase[1]);
      });
    }
  });
  describe('#isAdj()', function() {
    it(`grün`, function() {
      assert(gdh.isAdj('grün'));
    });
    it(`adj not found`, function() {
      assert(!gdh.isAdj('grünxxxx'));
    });
  });
});
