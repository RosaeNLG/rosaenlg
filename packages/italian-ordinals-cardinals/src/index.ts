/**
 * @license
 * Copyright 2020, Marco Riva, 2019, Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import * as n2words from '../../rosaenlg-n2words/dist/n2words_IT.js';

const fixedOrdinals = {
  M: {
    1: 'primo',
    2: 'secondo',
    3: 'terzo',
    4: 'quarto',
    5: 'quinto',
    6: 'sesto',
    7: 'settimo',
    8: 'ottavo',
    9: 'nono',
    10: 'decimo',
    1000000: 'milionesimo',
    1000000000: 'miliardesimo',
  },
  F: {
    1: 'prima',
    2: 'seconda',
    3: 'terza',
    4: 'quarta',
    5: 'quinta',
    6: 'sesta',
    7: 'settima',
    8: 'ottava',
    9: 'nona',
    10: 'decima',
    1000000: 'milionesima',
    1000000000: 'miliardesima',
  },
};

const suffix = {
  M: 'esimo',
  F: 'esima',
};

const it = { lang: 'it' };

type GendersMF = 'M' | 'F';

export function getOrdinal(val: number, gender: GendersMF = 'M'): string {
  if (val in fixedOrdinals[gender]) return fixedOrdinals[gender][val];
  else if (val < 1000000) {
    const lastTwoDigits = val % 100;
    const lastDigit = lastTwoDigits % 10;
    const secondLastDigit = Math.floor(lastTwoDigits / 10);

    // 23 -> ventitré -> ventitreesimo
    let cardinal = n2words(val, it).replace(/é/g, 'e');

    // 846 -> ottocentoquarantaseiesimo -> no need to cut off last char
    // 816 -> ottocentosedicesimo -> need to cut
    // 823 -> ottocentoventitreesimo -> no need to cut of the double 'e'
    if ((lastDigit == 6 && secondLastDigit != 1) || (lastDigit == 3 && secondLastDigit != 1))
      return cardinal + suffix[gender];

    cardinal = cardinal.slice(0, -1);

    // 12000 -> dodicimillesimo, need to double the 'l'
    if (cardinal.endsWith('mil')) cardinal = cardinal.replace('mil', 'mill');

    return cardinal + suffix[gender];
  }

  const err = new Error();
  err.name = 'RangeError';
  err.message = `Italian ordinal not found for ${val}`;
  throw err;
}
