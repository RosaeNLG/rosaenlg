const assert = require('assert');
const lib = require('../dist/index.js');

const testCases = [
  ['DEFINITE', null, null, 'S', null, null, 'the'],
  ['DEFINITE', null, null, 'P', null, null, ''],
  ['DEFINITE', null, null, 'P', null, false, ''],
  ['DEFINITE', null, null, 'P', null, true, 'the'],
  ['INDEFINITE', null, null, 'S', null, null, 'a'],
  ['INDEFINITE', null, null, 'P', null, null, ''],
  ['DEMONSTRATIVE', null, null, 'S', 'NEAR', null, 'this'],
  ['DEMONSTRATIVE', null, null, 'S', 'FAR', null, 'that'],
  ['DEMONSTRATIVE', null, null, 'P', 'NEAR', null, 'these'],
  ['DEMONSTRATIVE', null, null, 'P', null, null, 'these'],
  ['DEMONSTRATIVE', null, null, 'P', 'FAR', null, 'those'],

  ['POSSESSIVE', 'M', 'S', null, null, null, 'his'],
  ['POSSESSIVE', 'F', 'S', null, null, null, 'her'],
  ['POSSESSIVE', 'N', 'S', null, null, null, 'its'],
  ['POSSESSIVE', 'N', 'P', null, null, null, 'their'],
];

describe('english-determiners', function () {
  describe('#getDet()', function () {
    describe('nominal', function () {
      testCases.forEach(function (testCase) {
        const detType = testCase[0];
        const genderOwner = testCase[1];
        const numberOwner = testCase[2];
        const numberOwned = testCase[3];
        const dist = testCase[4];
        const forceArticlePlural = testCase[5];
        const expected = testCase[6];

        it(`${detType} owner:${genderOwner}${numberOwner} owned:${numberOwned} ${dist} forceArticlePlural: ${forceArticlePlural} => ${expected}`, function () {
          assert.equal(lib.getDet(detType, genderOwner, numberOwner, numberOwned, dist, forceArticlePlural), expected);
        });
      });
    });

    describe('edge cases', function () {
      it('invalid det type', () => assert.throws(() => lib.getDet('blabla', null, null, 'S', null), /determiner/));
      it('invalid number owned', () => assert.throws(() => lib.getDet('DEFINITE', null, null, 'X', null), /number/));
      it('invalid dist', () => assert.throws(() => lib.getDet('DEMONSTRATIVE', null, null, 'S', 'NEAR_FAR'), /dist/));
      it('invalid gender', () => assert.throws(() => lib.getDet('POSSESSIVE', 'X', 'S', 'S', null), /gender/));
      it('invalid number owner', () => assert.throws(() => lib.getDet('POSSESSIVE', 'M', 'X', 'S', null), /number/));
    });
  });
});
