const lib = require('../dist/index.js');
const assert = require('assert');

const testCases = {
  blabla: false,
  camembert: false,
  // h
  hérisson: false,
  Hérisson: false,
  homme: true,
  Homme: true,
  // vowels
  à: true, // d'à côté
  aéroplane: true,
  eau: true,
  Einstein: true,
  ouistiti: false,
  oukaze: true,
  iode: true,
  iota: false,
  iench: false,
  //y
  yéti: false,
  Yiddish: false,
  yaourt: false,
  'ylang-ylang': true,
  y: true, // d'y aller
  // new ones
  onze: false,
  onzième: false,
  oui: false,
  uhlan: false,
  yatagan: false,
};

describe('french-contractions', function () {
  describe('#contracts()', function () {
    const keys = Object.keys(testCases);
    for (let i = 0; i < keys.length; i++) {
      const word = keys[i];
      const expected = testCases[word];
      it(`${word} => contracted? ${expected}`, function () {
        assert.equal(lib.contracts(word), expected);
      });
    }
  });
  describe('#contracts() with override', function () {
    it(`l'hérisson`, function () {
      assert.equal(lib.contracts('hérisson', { hérisson: { contracts: true } }), true);
    });
  });
  describe('#isContractedVowelWord()', function () {
    it('not a vowel', function () {
      assert(!lib.isContractedVowelWord('toto'));
    });
  });

  describe('#isHAspire()', function () {
    it('hâbleuse aspiré', function () {
      assert(lib.isHAspire('hâbleuse'));
    });
    it('homme pas aspiré', function () {
      assert(!lib.isHAspire('homme'));
    });
    it('toto pas aspiré', function () {
      assert(!lib.isHAspire('toto'));
    });
  });
  describe('#isHMuet()', function () {
    it('homme muet', function () {
      assert(lib.isHMuet('homme'));
    });
    it('toto pas muet', function () {
      assert(!lib.isHMuet('toto'));
    });
  });
  describe('#getCompleteList()', function () {
    it('hérisson', function () {
      assert(lib.getCompleteList().indexOf('hérisson') > -1);
    });
  });
});
