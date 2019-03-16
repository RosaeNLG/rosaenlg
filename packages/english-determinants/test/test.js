var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', 'S', null, 'the' ],
  [ 'DEFINITE', 'P', null, '' ],
  [ 'INDEFINITE', 'S', null, 'a' ],
  [ 'INDEFINITE', 'P', null, '' ],
  [ 'DEMONSTRATIVE', 'S', 'NEAR', 'this' ],
  [ 'DEMONSTRATIVE', 'S', 'FAR', 'that' ],
  [ 'DEMONSTRATIVE', 'P', 'NEAR', 'these' ],
  [ 'DEMONSTRATIVE', 'P', null, 'these' ],
  [ 'DEMONSTRATIVE', 'P', 'FAR', 'those' ],
];


describe('english-determinants', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const number = testCase[1];
      const dist = testCase[2];
      const expected = testCase[3];
  
      it(
        `${detType} ${number} ${dist} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, number, dist), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', 'S', null), /determinant/ ) );
      it( 'invalid number', () => assert.throws( () => lib.getDet('DEFINITE', 'X', null), /number/ ) );
      it( 'invalid dist', () => assert.throws( () => lib.getDet('DEMONSTRATIVE', 'S', 'NEAR_FAR'), /dist/ ) );
    });

  });
});

