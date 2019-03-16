var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', 'NOMINATIVE', 'M', 'S', 'der' ],
  [ 'DEMONSTRATIVE', 'GENITIVE', null, 'P', 'dieser' ],
  [ 'DEFINITE', 'DATIVE', 'M', 'P', 'denen' ],

];


describe('german-determinants', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const germanCase = testCase[1];
      const gender = testCase[2];
      const number = testCase[3];
      const expected = testCase[4];
  
      it(
        `${detType} ${germanCase} ${gender} ${number} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, germanCase, gender, number), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid gender', () => assert.throws( () => lib.getDet('DEFINITE', 'NOMINATIVE', 'X', 'S'), /gender/ ) );
      it( 'invalid number', () => assert.throws( () => lib.getDet('DEFINITE', 'NOMINATIVE', 'M', 'X'), /number/ ) );
      it( 'invalid case', () => assert.throws( () => lib.getDet('DEFINITE', 'blabla', 'M', 'S'), /case/ ) );
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', 'NOMINATIVE', 'M', 'S'), /determinant/ ) );
    });

  });
});

