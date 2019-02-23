var assert = require('assert');
var FrenchVerbs = require('../dist/index.js');

describe('french-verbs', function() {
  describe('#getConjugation()', function() {

    it(`null params`, function() { assert.throws( () => 
      FrenchVerbs.getConjugation(null), /null/)
    });
    it(`null verb`, function() { assert.throws( () => 
      FrenchVerbs.getConjugation({verb:null}), /verb/)
    });
    it(`null person`, function() { assert.throws( () => 
      FrenchVerbs.getConjugation({verb:'manger'}), /person/)
    });
    it(`invalid tense`, function() { assert.throws( () => 
      FrenchVerbs.getConjugation({verb:'manger', person:1, tense: 'blabla'}), /tense/)
    });
    it(`verb not in dict`, function() { assert.throws( () => 
      FrenchVerbs.getConjugation({verb:'farfouillasser', person:1, tense: 'PRESENT'}), /dict/)
    });

  });
});
