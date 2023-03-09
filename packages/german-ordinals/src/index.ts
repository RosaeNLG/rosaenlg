/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

const germanOrdinals = [
  'erste',
  'zweite',
  'dritte',
  'vierte',
  'fünfte',
  'sechste',
  'siebte',
  'achte',
  'neunte',
  'zehnte',
  'elfte',
  'zwölfte',
  'dreizehnte',
  'vierzehnte',
  'fünfzehnte',
  'sechzehnte',
  'siebzehnte',
  'achtzehnte',
  'nehnzehnte',
  'zwanzigste',
  'einundzwanzigste',
  'zweiundzwanzigste',
  'dreiundzwanzigste',
  'vierundzwanzigste',
  'fünfundzwanzigste',
  'sechsundzwanzigste',
  'siebenundzwanzigste',
  'achtundzwanzigste',
  'neunundzwanzigste',
  'dreißigste',
];

export function getOrdinal(val: number): string {
  if (val <= 30) {
    return germanOrdinals[val - 1];
  } else {
    const err = new Error();
    err.name = 'RangeError';
    err.message = `out of bound, German ordinal only works with <= ${germanOrdinals.length}`;
    throw err;
  }
}
