var assert = require('assert');
var FrenchVerbs = require('../dist/index.js');

describe('french-verbs', function() {
  describe('#getConjugation()', function() {
    it(`null verb`, function() {
      assert.throws(() => FrenchVerbs.getConjugation(null), /verb/);
    });
    it(`null person`, function() {
      assert.throws(() => FrenchVerbs.getConjugation('manger', null), /person/);
    });
    it(`invalid tense`, function() {
      assert.throws(() => FrenchVerbs.getConjugation('manger', 1, null, null, 'blabla'), /tense/);
    });
    it(`verb not in dict`, function() {
      assert.throws(() => FrenchVerbs.getConjugation('farfouillasser', 1, null, null, 'PRESENT'), /dict/);
    });
  });
});
