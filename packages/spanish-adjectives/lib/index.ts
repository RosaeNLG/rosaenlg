/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import { nationalAdjectives } from './nationals';
import { invariables } from './invariables';

export type Genders = 'M' | 'F';
export type Numbers = 'S' | 'P';

const consonants = 'bcdfghjklmnpqrstvwxz';
function endsWithConsonant(str: string): boolean {
  const regex = RegExp(`[${consonants}]$`);
  return regex.test(str);
}

const vowels = 'aeiouáéíóú';
function endsWithVowel(str: string): boolean {
  const regex = RegExp(`[${vowels}]$`);
  return regex.test(str);
}

const corrAccentToNonAccent = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
};

const pluralExceptions = {
  virgen: 'vírgenes',
  joven: 'jóvenes',
};

export function agreeAdjective(adjective: string, gender: Genders, number: Numbers, precedesNoun?: boolean): string {
  //console.log(`${adjective} ${gender} ${number} ${precedesNoun}`);
  if (!adjective) {
    const noAdjErr = new Error();
    noAdjErr.name = 'TypeError';
    noAdjErr.message = `adjective is mandatory`;
    throw noAdjErr;
  }

  if (gender != 'M' && gender != 'F') {
    const genderErr = new Error();
    genderErr.name = 'TypeError';
    genderErr.message = `gender must be M F`;
    throw genderErr;
  }
  if (number != 'S' && number != 'P') {
    const numberErr = new Error();
    numberErr.name = 'TypeError';
    numberErr.message = `number must be S or P`;
    throw numberErr;
  }

  if (invariables.indexOf(adjective) > -1) {
    return adjective;
  }

  if (precedesNoun) {
    const mpApo = {
      bueno: 'buen',
      malo: 'mal',
      alguno: 'algún',
      ninguno: 'ningún',
      uno: 'un',
      primero: 'primer',
      tercero: 'tercer',
    };
    if (gender == 'M' && number == 'S' && adjective in mpApo) {
      return mpApo[adjective];
    } else if (adjective == 'grande' && number == 'S') {
      return 'gran';
    } else if (adjective == 'ciento' && number == 'P') {
      return 'cien';
    } else if (adjective == 'cualquiera' && number == 'S') {
      return 'cualquier';
    }
  }

  // must stay AFTER precedesNoun
  if (gender == 'M' && number == 'S') {
    return adjective;
  }

  if (nationalAdjectives.indexOf(adjective) > -1) {
    // https://www.spanishdict.com/guide/nationalities-in-spanish
    if (adjective.endsWith('o')) {
      // exactly the same as no nationality
      const endings = {
        M: { P: 'os' },
        F: { S: 'a', P: 'as' },
      };
      return adjective.slice(0, -1) + endings[gender][number];
    } else if (endsWithVowel(adjective)) {
      // ends with vowel
      if (adjective.endsWith('e') || adjective.endsWith('é') || adjective.endsWith('a')) {
        return adjective + (number == 'S' ? '' : 's');
      } else {
        return adjective + (number == 'S' ? '' : 'es');
      }
    } /*if (endsWithConsonant(adjective))*/ else {
      // remove the accent (PS: M S is already managed)
      const newBase = adjective.replace(/([áéíóú])(.)$/, function (_match, accent: string, last: string): string {
        // console.log(`accent: <${accent}> last: <${last}>`);
        return corrAccentToNonAccent[accent] + last;
      });
      // console.log('new base: ' + newBase);
      if (gender == 'F') {
        return newBase + 'a' + (number == 'S' ? '' : 's');
      } else {
        // MP
        return newBase + 'es';
      }
    }
  } else if (adjective.endsWith('o')) {
    const endings = {
      M: { P: 'os' },
      F: { S: 'a', P: 'as' },
    };
    return adjective.slice(0, -1) + endings[gender][number];
  } else if (adjective.endsWith('e') || adjective.endsWith('ista') || /[aeiuáéíóú]$/.test(adjective)) {
    return adjective + (number == 'P' ? 's' : '');
  } else if (endsWithConsonant(adjective)) {
    if (adjective.endsWith('z')) {
      if (number == 'P') {
        return adjective.slice(0, -1) + 'ces';
      } else {
        return adjective;
      }
    } else if (adjective.endsWith('erior')) {
      // Adjectives ending in -erior do not have a feminine form.
      return adjective + (number == 'P' ? 'es' : '');
    } else if (
      adjective.endsWith('or') ||
      adjective.endsWith('án') ||
      adjective.endsWith('ón') ||
      adjective.endsWith('ín')
    ) {
      const newBase =
        adjective.slice(0, -2) +
        (corrAccentToNonAccent[adjective.slice(-2, -1)] || adjective.slice(-2, -1)) +
        adjective.slice(-1);

      if (gender == 'M') {
        // number IS P
        return newBase + 'es';
      } else {
        // gender F
        return newBase + (number == 'S' ? 'a' : 'as');
      }
    } else if (pluralExceptions[adjective] != null) {
      return number == 'P' ? pluralExceptions[adjective] : adjective;
    } else {
      return adjective + (number == 'P' ? 'es' : '');
    }
  }

  const invalidAjErr = new Error();
  invalidAjErr.name = 'DictError';
  invalidAjErr.message = `invalid adjective`;
  throw invalidAjErr;
}
