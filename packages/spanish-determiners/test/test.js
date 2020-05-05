const assert = require('assert');
const lib = require('../dist/index.js');

const testCasesDefinite = [
  // regular
  ['M', 'S', 'hombre', 'el'],
  ['M', 'P', 'hombres', 'los'],
  ['F', 'S', 'mujer', 'la'],
  ['F', 'P', 'mujeres', 'las'],
  ['N', 'S', 'bueno', 'lo'],
  // el f
  ['F', 'S', 'agua', 'el'],
  ['F', 'S', 'Águila', 'el'],
  ['F', 'P', 'aguas', 'las'], // plural
  ['F', 'P', 'agua', 'las'], // plural
  // 3 exceptions to el f
  ['F', 'S', 'hache', 'la'],
  ['F', 'S', 'a', 'la'],
  ['F', 'S', 'Haya', 'la'],
  // both possible
  ['M', 'S', 'ácrata', 'el'],
  ['F', 'S', 'ácrata', 'la'],
  // adjectives
  ['F', 'S', 'alta montaña', 'la'],
  // strange one
  ['M', 'S', 'azúcar', 'el'],
  ['F', 'S', 'azúcar', 'el'], // both possible but el is probably better
];

const testCasesIndefinite = [
  ['M', 'S', 'hombre', 'un'],
  ['M', 'P', 'hombres', 'unos'],
  ['F', 'S', 'mujer', 'una'],
  ['F', 'P', 'mujeres', 'unas'],
  ['N', 'S', 'oscuro', 'uno'],
  // el f
  ['F', 'S', 'ala', 'un'],
  ['F', 'S', 'árabe', 'una'],
  ['F', 'S', 'alta montaña', 'una'], // with adj
];

const testCasesDemonstrative = [
  // prox
  ['M', 'S', null, 'este'],
  ['M', 'S', null, 'este'],
  ['M', 'S', 'PROXIMAL', 'este'],
  ['M', 'P', null, 'estos'],
  ['F', 'P', null, 'estas'],
  // medial
  ['M', 'S', 'MEDIAL', 'ese'],
  ['F', 'S', 'MEDIAL', 'esa'],
  ['M', 'P', 'MEDIAL', 'esos'],
  ['F', 'P', 'MEDIAL', 'esas'],
  // distal
  ['M', 'S', 'DISTAL', 'aquel'],
  ['F', 'S', 'DISTAL', 'aquella'],
  ['M', 'P', 'DISTAL', 'aquellos'],
  ['F', 'P', 'DISTAL', 'aquellas'],
];

const testCasesPossessive = [
  ['M', 'S', 'su'],
  ['F', 'S', 'su'],
  ['M', 'P', 'sus'],
  ['F', 'P', 'sus'],
];

describe('spanish-determiners', function () {
  describe('#getDet()', function () {
    describe('nominal', function () {
      describe('definite', function () {
        testCasesDefinite.forEach(function (testCase) {
          const gender = testCase[0];
          const number = testCase[1];
          const after = testCase[2];
          const expected = testCase[3];
          it(`${gender} ${number} ${after} => ${expected}`, function () {
            assert.equal(lib.getDet('DEFINITE', gender, number, after), expected);
          });
        });
      });
      describe('indefinite', function () {
        testCasesIndefinite.forEach(function (testCase) {
          const gender = testCase[0];
          const number = testCase[1];
          const after = testCase[2];
          const expected = testCase[3];
          it(`${gender} ${number} ${after} => ${expected}`, function () {
            assert.equal(lib.getDet('INDEFINITE', gender, number, after), expected);
          });
        });
      });
      describe('demonstrative', function () {
        testCasesDemonstrative.forEach(function (testCase) {
          const gender = testCase[0];
          const number = testCase[1];
          const dist = testCase[2];
          const expected = testCase[3];
          it(`${gender} ${number} ${dist} => ${expected}`, function () {
            assert.equal(lib.getDet('DEMONSTRATIVE', gender, number, null, dist), expected);
          });
        });
      });
      describe('possessive', function () {
        testCasesPossessive.forEach(function (testCase) {
          const gender = testCase[0];
          const number = testCase[1];
          const expected = testCase[2];
          it(`${gender} ${number} => ${expected}`, function () {
            assert.equal(lib.getDet('POSSESSIVE', gender, number, null, null), expected);
          });
        });
      });
    });

    describe('edge cases', function () {
      it('invalid det type', () => assert.throws(() => lib.getDet('TOTO', 'M', 'S', null, null), /determiner type/));
      it('invalid distance', () =>
        assert.throws(() => lib.getDet('DEMONSTRATIVE', 'M', 'S', null, 'SOMEWHERE'), /distance/));
      it('invalid gender owned', () => assert.throws(() => lib.getDet('DEFINITE', 'X', 'S', null, null), /gender/));
      it('invalid number owned', () => assert.throws(() => lib.getDet('DEFINITE', 'M', 'X', null, null), /number/));
      it('neutral demonstrative', () =>
        assert.throws(() => lib.getDet('DEMONSTRATIVE', 'N', 'S', null, null), /neutral/));
      it('neutral plural', () => assert.throws(() => lib.getDet('DEFINITE', 'N', 'P', null, null), /neutral/));
    });
  });
});
