var assert = require('assert');
var lib = require('../dist/index.js');

const testCases = [
  [ 'DEFINITE', null, null, 'S', null,        'the' ],
  [ 'DEFINITE', null, null, 'P', null,        '' ],
  [ 'INDEFINITE', null, null, 'S', null,      'a' ],
  [ 'INDEFINITE', null, null, 'P', null,      '' ],
  [ 'DEMONSTRATIVE', null, null, 'S', 'NEAR', 'this' ],
  [ 'DEMONSTRATIVE', null, null, 'S', 'FAR',  'that' ],
  [ 'DEMONSTRATIVE', null, null, 'P', 'NEAR', 'these' ],
  [ 'DEMONSTRATIVE', null, null, 'P', null,   'these' ],
  [ 'DEMONSTRATIVE', null, null, 'P', 'FAR', 'those' ],

  [ 'POSSESSIVE', 'M', 'S', null, null, 'his' ],
  [ 'POSSESSIVE', 'F', 'S', null, null, 'her' ],
  [ 'POSSESSIVE', 'N', 'S', null, null, 'its' ],
  [ 'POSSESSIVE', 'N', 'P', null, null, 'their' ],
];


describe('english-determiners', function() {
  describe('#getDet()', function() {

    testCases.forEach(function(testCase) {

      const detType = testCase[0];
      const genderOwner = testCase[1];
      const numberOwner = testCase[2];
      const numberOwned = testCase[3];
      const dist = testCase[4];
      const expected = testCase[5];
  
      it(
        `${detType} owner:${genderOwner}${numberOwner} owned:${numberOwned} ${dist} => ${expected}`, function() {
          assert.equal( lib.getDet( detType, genderOwner, numberOwner, numberOwned, dist), expected )
        });
    });

    describe('edge cases', function() {
      it( 'invalid det type', () => assert.throws( () => lib.getDet('blabla', null, null, 'S', null), /determiner/ ) );
      it( 'invalid number owned', () => assert.throws( () => lib.getDet('DEFINITE', null, null, 'X', null), /number/ ) );
      it( 'invalid dist', () => assert.throws( () => lib.getDet('DEMONSTRATIVE', null, null, 'S', 'NEAR_FAR'), /dist/ ) );
      it( 'invalid gender', () => assert.throws( () => lib.getDet('POSSESSIVE', 'X', 'S', 'S', null), /gender/ ) );
      it( 'invalid number owner', () => assert.throws( () => lib.getDet('POSSESSIVE', 'M', 'X', 'S', null), /number/ ) );

    });

  });
});

