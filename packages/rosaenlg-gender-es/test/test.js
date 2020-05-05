const gender = require('../');
const assert = require('assert');

const testCasesGender = [
  // M
  ['sentención', 'm'],
  ['libro', 'm'],
  ['zapato', 'm'],
  ['profesor', 'm'],
  ['padre ', 'm'],
  ['día', 'm'],
  ['mapa', 'm'],
  ['sofá', 'm'],
  ['drama', 'm'],
  ['problema', 'm'],
  ['planeta', 'm'],
  ['tranviá', 'm'],
  ['huésped', 'm'],
  ['aprendiz', 'm'],
  ['avión', 'm'],
  ['árbol', 'm'],
  ['calor', 'm'], // both exist
  ['mar', 'm'], // both exist
  // F
  ['casa', 'f'],
  ['boca', 'f'],
  ['madre', 'f'],
  ['mujer', 'f'],
  ['foto', 'f'],
  ['disco', 'n'],
  ['moto', 'f'],
  ['radio', 'f'],
  ['carne', 'f'],
  ['piel', 'f'],
  ['televisión', 'f'],
  ['universidad', 'f'],
  ['actriz', 'f'],
  ['agua', 'f'],
  // exceptions?
  ['hache', 'f'],
  ['a', 'f'],
  // N
  ['ciclista', 'n'],
  ['periodista', 'n'],
  ['presente', 'n'],
  ['decente', 'n'],
  // exceptions
  ['nirvana', 'm'],
  ['reúma', 'n'],
  ['buda', 'm'],
  ['bueno', 'n'],
];

describe('rosaenlg-gender-es', function () {
  for (let i = 0; i < testCasesGender.length; i++) {
    const testCase = testCasesGender[i];
    it(`${testCase[0]} => ${testCase[1]}`, function () {
      assert.equal(gender(testCase[0]), testCase[1]);
    });
  }
});
