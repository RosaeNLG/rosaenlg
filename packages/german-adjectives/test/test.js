var assert = require('assert');
var GermanAdjectives = require('../dist/index.js');

const testCases = [
  [ 'alt', 'NOMINATIVE', 'M', 'S', 'DEFINITE', 'alte'],
  [ 'alt', 'DATIVE', 'N', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEFINITE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE', 'alten'],
  [ 'alt', 'GENITIVE', 'F', 'P', 'DEMONSTRATIVE', 'alten'],

];

describe('german-adjectives', function() {
  describe('#agreeGermanAdjective()', function() {
    for (var i=0; i<testCases.length; i++) {
      const testCase = testCases[i];
      it(`${testCase[0]}`, function() {
        assert.equal(
          GermanAdjectives.agreeGermanAdjective(testCase[0], testCase[1], testCase[2], testCase[3], testCase[4]),
          testCase[5]          
        )
      });
    }

    // edge cases
    it(`invalid case`, function() {
      assert.throws( () => GermanAdjectives.agreeGermanAdjective('alt', 'ADMINISTRATIVE', 'F', 'S', 'DEMONSTRATIVE'), /case/ )
    });
    it(`adjective not in dict`, function() {
      assert.throws( () => GermanAdjectives.agreeGermanAdjective('blabla', 'GENITIVE', 'F', 'S', 'DEMONSTRATIVE'), /dict/ )
    });
    it(`invalid determiner`, function() {
      assert.throws( () => GermanAdjectives.agreeGermanAdjective('alt', 'GENITIVE', 'F', 'S', 'GESTICULATIVE'), /determin/ )
    });
    it(`invalid gender`, function() {
      assert.throws( () => GermanAdjectives.agreeGermanAdjective('alt', 'NOMINATIVE', 'X', 'S', 'DEFINITE'), /gender/ )
    });
    it(`invalid number`, function() {
      assert.throws( () => GermanAdjectives.agreeGermanAdjective('alt', 'NOMINATIVE', 'F', 'X', 'DEFINITE'), /number/ )
    });


  });
});
