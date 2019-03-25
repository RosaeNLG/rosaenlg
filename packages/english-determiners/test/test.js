var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', null, 'S', null, 'the' ],
  [ 'DEFINITE', null, 'P', null, '' ],
  [ 'INDEFINITE', null, 'S', null, 'a' ],
  [ 'INDEFINITE', null, 'P', null, '' ],
  [ 'DEMONSTRATIVE', null, 'S', 'NEAR', 'this' ],
  [ 'DEMONSTRATIVE', null, 'S', 'FAR', 'that' ],
  [ 'DEMONSTRATIVE', null, 'P', 'NEAR', 'these' ],
  [ 'DEMONSTRATIVE', null, 'P', null, 'these' ],
  [ 'DEMONSTRATIVE', null, 'P', 'FAR', 'those' ],
  [ 'POSSESSIVE', 'M', 'S', null, 'his' ],
  [ 'POSSESSIVE', 'F', 'S', null, 'her' ],
  [ 'POSSESSIVE', 'N', 'S', null, 'its' ],
  [ 'POSSESSIVE', 'N', 'P', null, 'their' ],
];


describe('english-determiners', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const gender = testCase[1];
      const number = testCase[2];
      const dist = testCase[3];
      const expected = testCase[4];
  
      it(
        `${detType} ${number} ${dist} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, gender, number, dist), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', null, 'S', null), /determiner/ ) );
      it( 'invalid gender', () => assert.throws( () => lib.getDet('POSSESSIVE', 'X', 'S', null), /gender/ ) );
      it( 'invalid number', () => assert.throws( () => lib.getDet('DEFINITE', null, 'X', null), /number/ ) );
      it( 'invalid dist', () => assert.throws( () => lib.getDet('DEMONSTRATIVE', null, 'S', 'NEAR_FAR'), /dist/ ) );
    });

  });
});

