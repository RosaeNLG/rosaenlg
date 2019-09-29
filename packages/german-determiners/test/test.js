const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  ['DEFINITE', 'NOMINATIVE', null, null, 'M', 'S', 'der'],
  ['DEMONSTRATIVE', 'GENITIVE', null, null, 'M', 'P', 'dieser'],
  ['DEFINITE', 'DATIVE', null, null, 'M', 'P', 'denen'],

  ['INDEFINITE', 'NOMINATIVE', null, null, 'F', 'S', 'eine'],
  ['INDEFINITE', 'DATIVE', null, null, 'M', 'S', 'einem'],
  ['INDEFINITE', 'DATIVE', null, null, 'M', 'P', ''],

  ['POSSESSIVE', 'NOMINATIVE', 'M', 'S', 'M', 'S', 'sein'],
  ['POSSESSIVE', 'NOMINATIVE', 'M', 'S', 'N', 'S', 'sein'],
  ['POSSESSIVE', 'NOMINATIVE', 'M', 'S', 'F', 'S', 'seine'],
  ['POSSESSIVE', 'NOMINATIVE', 'M', 'S', 'M', 'P', 'seine'],
  ['POSSESSIVE', 'NOMINATIVE', 'N', 'S', 'F', 'S', 'seine'],

  ['POSSESSIVE', 'GENITIVE', 'N', 'S', 'M', 'S', 'seines'],
  ['POSSESSIVE', 'GENITIVE', 'N', 'S', 'N', 'S', 'seines'],
  ['POSSESSIVE', 'GENITIVE', 'N', 'S', 'N', 'P', 'seiner'],
  ['POSSESSIVE', 'GENITIVE', 'N', 'S', 'F', 'S', 'seiner'],
  ['POSSESSIVE', 'GENITIVE', 'F', 'S', 'F', 'S', 'ihrer'],
  ['POSSESSIVE', 'GENITIVE', 'M', 'P', 'F', 'S', 'ihrer'],
];

describe('german-determiners', function() {
  describe('nominal', function() {
    describe('#getDet()', function() {
      testCases.forEach(function(testCase) {
        const detType = testCase[0];
        const germanCase = testCase[1];
        const genderOwner = testCase[2];
        const numberOwner = testCase[3];
        const genderOwned = testCase[4];
        const numberOwned = testCase[5];
        const expected = testCase[6];

        it(`${detType} ${germanCase} owner:${genderOwner}${numberOwner} owned:${genderOwned}${numberOwned} => ${expected}`, function() {
          assert.equal(lib.getDet(detType, germanCase, genderOwner, numberOwner, genderOwned, numberOwned), expected);
        });
      });
    });

    describe('edge cases', function() {
      it('invalid gender owned', () =>
        assert.throws(() => lib.getDet('DEFINITE', 'NOMINATIVE', null, null, 'X', 'S'), /gender/));
      it('invalid gender owner', () =>
        assert.throws(() => lib.getDet('POSSESSIVE', 'NOMINATIVE', 'X', 'S', 'F', 'S'), /gender/));
      it('invalid number owned', () =>
        assert.throws(() => lib.getDet('DEFINITE', 'NOMINATIVE', null, null, 'M', 'X'), /number/));
      it('invalid number owner', () =>
        assert.throws(() => lib.getDet('POSSESSIVE', 'NOMINATIVE', 'F', 'X', 'F', 'S'), /number/));
      it('invalid case', () => assert.throws(() => lib.getDet('DEFINITE', 'blabla', null, null, 'M', 'S'), /case/));
      it('invalid case when possessive', () =>
        assert.throws(() => lib.getDet('POSSESSIVE', 'DATIVE', 'M', 'S', 'M', 'S'), /case/));
      it('invalid det type', () =>
        assert.throws(() => lib.getDet('blabla', 'NOMINATIVE', null, null, 'M', 'S'), /determiner/));
    });
  });
});
