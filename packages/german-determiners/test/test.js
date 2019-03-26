var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', 'NOMINATIVE', null, 'M', 'S', 'der' ],
  [ 'DEMONSTRATIVE', 'GENITIVE', null, null, 'P', 'dieser' ],
  [ 'DEFINITE', 'DATIVE', null, 'M', 'P', 'denen' ],

  [ 'POSSESSIVE', 'NOMINATIVE', 'F', 'M', 'S', 'ihr' ],
  [ 'POSSESSIVE', 'NOMINATIVE', 'F', 'F', 'S', 'ihre' ],
  [ 'POSSESSIVE', 'NOMINATIVE', 'F', 'N', 'S', 'ihr' ],
  [ 'POSSESSIVE', 'GENITIVE', 'N', 'F', 'S', 'seiner' ],

  [ 'POSSESSIVE', 'GENITIVE', 'N', 'F', 'P', 'seiner' ],
  [ 'POSSESSIVE', 'GENITIVE', 'N', null, 'P', 'seiner' ],

];


describe('german-determiners', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const germanCase = testCase[1];
      const genderOwner = testCase[2];
      const genderOwned = testCase[3];
      const number = testCase[4];
      const expected = testCase[5];
  
      it(
        `${detType} ${germanCase} owner:${genderOwner} owned:${genderOwned} ${number} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, germanCase, genderOwner, genderOwned, number), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid gender owned', () => assert.throws( () => lib.getDet('DEFINITE', 'NOMINATIVE', null, 'X', 'S'), /gender/ ) );
      it( 'invalid gender owner', () => assert.throws( () => lib.getDet('POSSESSIVE', 'NOMINATIVE', 'X', 'F', 'S'), /gender/ ) );
      it( 'invalid number', () => assert.throws( () => lib.getDet('DEFINITE', 'NOMINATIVE', null, 'M', 'X'), /number/ ) );
      it( 'invalid case', () => assert.throws( () => lib.getDet('DEFINITE', 'blabla', null, 'M', 'S'), /case/ ) );
      it( 'invalid case when possessive', () => assert.throws( () => lib.getDet('POSSESSIVE', 'DATIVE', 'M', 'M', 'S'), /case/ ) );
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', 'NOMINATIVE', null, 'M', 'S'), /determiner/ ) );
    });

  });
});

