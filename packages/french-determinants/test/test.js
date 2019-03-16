var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', 'M', 'S', 'le' ],
  [ 'DEFINITE', 'F', 'S', 'la' ],
  [ 'INDEFINITE', 'M', 'P', 'des' ],
  [ 'DEMONSTRATIVE', 'F', 'S', 'cette' ],
  [ 'DEMONSTRATIVE', null, 'P', 'ces' ],
];


describe('french-determinants', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const gender = testCase[1];
      const number = testCase[2];
      const expected = testCase[3];
  
      it(
        `${detType} ${gender} ${number} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, gender, number), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', 'M', 'S'), /determinant/ ) );
      it( 'invalid gender', () => assert.throws( () => lib.getDet('DEFINITE', 'X', 'S'), /gender/ ) );
      it( 'invalid number', () => assert.throws( () => lib.getDet('DEFINITE', 'M', 'X'), /number/ ) );
    });

  });
});

