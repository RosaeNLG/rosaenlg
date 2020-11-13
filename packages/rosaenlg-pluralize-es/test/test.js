const pluralize = require('../');
const assert = require('assert');

const testCasesPlural = [
  // Add an “s” to nouns that end in vowels
  ['película', 'películas'],
  ['aplicación', 'aplicaciones'],
  ['niño', 'niños'],
  ['casa', 'casas'],
  ['zapato', 'zapatos'],
  // Add “es” to nouns that end in consonants
  ['color', 'colores'],
  ['botón', 'botones'],
  ['rey', 'reyes'],
  ['mes', 'meses'],
  ['profesor', 'profesores'],
  // Add “es” and drop the accent over the “o” if the noun ends in “ión”
  ['avión', 'aviones'],
  ['conversación', 'conversaciones'],
  ['televisión', 'televisiones'],
  // If a noun ends in “z”, add “es” and change the “z” to “c”
  ['lápiz', 'lápices'],
  ['actriz', 'actrices'],
  ['voz', 'voces'],
  // Nouns ending in “c” or “g”, change “c” → “qu” and “g” → “gu”, respectively
  ['frac', 'fraques'],
  ['zigzag', 'zigzagues'],
  // When the noun ends in “s” or “x” and the last syllable is unstressed, only change the article to plural
  ['análisis', 'análisis'],
  ['lunes', 'lunes'],
  ['martes', 'martes'],
  ['miércoles', 'miércoles'],
  ['jueves', 'jueves'],
  ['viernes', 'viernes'],
  ['tórax', 'tórax'],
  // existing ones
  ['avión', 'aviones'],
  ['televisión', 'televisiones'],
  ['lápiz', 'lápices'],
  ['pluma', 'plumas'],
  ['universidad', 'universidades'],
  ['café', 'cafés'],
  ['bongó', 'bongós'],
  ['zigzag', 'zigzagues'],
  ['frac', 'fraques'],
  ['bastón', 'bastones'],
  ['cajón', 'cajones'],
  ['país', 'paises'],
  ['lunes', 'lunes'],
  ['botón', 'botones'],
  ['rey', 'reyes'],
  ['color', 'colores'],
  ['mes', 'meses'],
  ['tórax', 'tórax'],
  ['paraguas', 'paraguas'],
  ['examen', 'exámenes'],
  ['luz', 'luces'],
  ['vez', 'veces'],
  ['café', 'cafés'],
  ['disc-jockey', 'disc-jockeys'],
  ['ciudad', 'ciudades'],
  ['imagen', 'imágenes'],
  ['interés', 'intereses'],
  ['espécimen', 'especímenes'],
  ['carácter', 'caracteres'],
  ['régimen', 'regímenes'],
  ['crisis', 'crisis'],
  ['martes', 'martes'],
  ['dosis', 'dosis'],
  ['diez', 'dieces'],
  ['club', 'clubes'],
  ['lápiz', 'lápices'],
  // exceptions
  ['joven', 'jóvenes'],
  ['examen', 'exámenes'],
  ['volumen', 'volúmenes'],
  ['imagen', 'imágenes'],
];

describe('rosaenlg-pluralize-es', function () {
  for (let i = 0; i < testCasesPlural.length; i++) {
    const testCase = testCasesPlural[i];
    it(`${testCase[0]} => ${testCase[1]}`, function () {
      assert.strictEqual(pluralize(testCase[0]), testCase[1]);
    });
  }
});
