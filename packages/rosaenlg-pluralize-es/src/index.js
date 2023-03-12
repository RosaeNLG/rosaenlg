/**
 * @license
 * Copyright 2019 Ludan Stoecklé, jfromaniello, swestrich
 * SPDX-License-Identifier: MIT
 */

'use strict';

const removeAccents = require('remove-accents');
const vowels = 'aeiou'.split('');

function isVowel(char) {
  const result = char.length === 1 && vowels.indexOf(removeAccents(char)) > -1;
  return result;
}

const exceptions = {
  mes: 'meses',
  // Note that some foreign words (that is, words which have come from another language, such as English) ending in a consonant just add -s.
  'disc-jockey': 'disc-jockeys',
  // Singular nouns of more than one syllable which end in -en and don’t already have an accent, add one in the plural.
  examen: 'exámenes',
  imagen: 'imágenes',
  espécimen: 'especímenes',
  carácter: 'caracteres',
  régimen: 'regímenes',
  volumen: 'volúmenes',
  origen: 'orígenes',
  germen: 'gérmenes',
  virgen: 'vírgenes',
  resumen: 'resúmenes',
  balón: 'balones',
  estación: 'estaciones',
  margen: 'márgenes',
  caimán: 'caimanes',
  joven: 'jóvenes',
  sartén: 'sartenes',
  huracán: 'huracanes',
};

module.exports = function (str) {
  //info can be found here:
  //http://lema.rae.es/dpd/?key=plural&lema=plural
  //http://www.studyspanish.com/lessons/plnoun.htm
  //http://www.spanishdict.com/topics/show/3

  //some things are conflicting though so there might be some issues.

  if (exceptions[str]) {
    return exceptions[str];
  } else {
    let plural;

    const lastLetter = str[str.length - 1], // Last letter of str
      last2Letters = str.slice(-2); // Last 2 letters of str
    // last3Letters = str.slice(-3);
    if (lastLetter === 'x') {
      //they don't change
      plural = str;
    } else if (last2Letters.match(/[áéíóú](n|s)$/)) {
      const radical = removeAccents(str);
      plural = radical + 'es';
    } else if (lastLetter === 'z') {
      //drop the z and add ces
      const radical = str.substring(0, str.length - 1);
      plural = radical + 'ces';
    } else if (lastLetter === 'c') {
      //drop the z and add ces
      const radical = str.substring(0, str.length - 1);
      plural = radical + 'ques';
    } else if (lastLetter === 'g') {
      //add an extra u
      plural = str + 'ues';
    } else if (isVowel(lastLetter)) {
      //easy, just add s
      plural = str + 's';
    } else if (lastLetter === 's') {
      //if the word ends with S but is not aguda
      //(accented in the last syllabe)
      plural = str;
    } else {
      plural = str + 'es';
    }

    return plural;
  }
};
